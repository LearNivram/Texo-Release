---
title: "Beispiel: Lager mit Go"
---

<!-- Übernommen aus LearNivram/Texo (examples/lager-go) mit scripts/docs-uebernehmen.mjs – bitte dort ändern. -->

# Lager: Texo und Go mit gemeinsamem Valkey

Eine Texo-Anwendung und ein Go-Dienst teilen sich einen Valkey-Server (`Kv`, siehe `docs/backend.md`):

| Was | Texo (`src/Lager.texo`) | Go (`go-dienst/main.go`) |
| --- | --- | --- |
| Bestand `bestand:<sku>` | `Kv.get<Int>`, `Kv.increment` | `SET … NX` (Anfangsbestand), `INCRBY` |
| `@Cache(key: "artikel:{sku}")` | schreibt `artikel:A-1` als JSON | liest ihn (`GET /artikel/A-1`) und leert ihn mit `PUBLISH texo:cache-clear Lager.artikel` |
| Buchungen | `Channel(topic: "lager:buchungen")`, live im Browser | `PUBLISH` und `SUBSCRIBE` auf demselben Kanal |
| Sitzung | `request.session` mit `TEXO_KV_SESSIONS=1` | liest `texo:session:<id>` zum Cookie (`GET /wer`) |
| Mehrere Instanzen | `"cluster": {"bus": "kv"}` in `texo.json` | – |

## Starten

```sh
docker run -d -p 6379:6379 valkey/valkey:8

export TEXO_KV_URL=valkey://localhost:6379 TEXO_KV_SESSIONS=1
(cd go-dienst && go run .) &          # http://localhost:8080
texo build && texo start dist          # http://localhost:3000
```

Dann im Browser `http://localhost:3000` öffnen, buchen und daneben

```sh
curl -X POST "localhost:8080/buchen?sku=A-1&menge=3"   # Bestand und Liste im Browser ändern sich sofort
curl localhost:8080/artikel/A-1                         # der @Cache-Eintrag von Texo
curl localhost:8080/wer                                  # im Browser: nach dem Anmelden der eigene Name
```

`tests/kv-beispiel.test.mjs` prüft genau diesen Ablauf von selbst.


## Quelltext

::: code-group

```text [go-dienst/go.mod]
module texo/examples/lager-go

go 1.24

require github.com/valkey-io/valkey-go v1.0.60

require golang.org/x/sys v0.31.0 // indirect
```

```go [go-dienst/main.go]
// Der Go-Dienst des Lager-Beispiels: teilt sich mit der Texo-Anwendung einen Valkey-Server (TEXO_KV_URL).
//
//	GET  /artikel/{sku}       liest den @Cache-Eintrag artikel:<sku>, den Texo geschrieben hat
//	POST /buchen?sku=&menge=  bucht den Bestand herunter, leert den @Cache aller Texo-Instanzen und meldet die
//	                          Buchung im Kanal lager:buchungen (kommt in Texo bei Channel(topic:) an)
//	GET  /wer                 liest die Texo-Sitzung zum Cookie tx_session (TEXO_KV_SESSIONS=1)
//
// Buchungen aus Texo empfängt der Dienst über SUBSCRIBE lager:buchungen und schreibt sie ins Log.
package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/valkey-io/valkey-go"
)

// Artikel und Buchung wie die data classes in src/Lager.texo (Feldnamen aus Texo).
type Artikel struct {
	SKU     string `json:"sku"`
	Name    string `json:"name"`
	Bestand int    `json:"bestand"`
}

type Buchung struct {
	SKU   string `json:"sku"`
	Menge int    `json:"menge"`
	Von   string `json:"von"`
}

func main() {
	opt, err := valkey.ParseURL(env("TEXO_KV_URL", "valkey://localhost:6379"))
	if err != nil {
		log.Fatal(err)
	}
	opt.DisableCache = true
	kv, err := valkey.NewClient(opt)
	if err != nil {
		log.Fatal(err)
	}
	defer kv.Close()
	prefix := os.Getenv("TEXO_KV_PREFIX")
	ctx := context.Background()

	// Anfangsbestand, falls noch keiner da ist
	for _, sku := range []string{"A-1", "A-2", "A-3"} {
		kv.Do(ctx, kv.B().Set().Key(prefix+"bestand:"+sku).Value("10").Nx().Build())
	}

	// Buchungen aus Texo (und die eigenen) mitlesen
	go func() {
		err := kv.Receive(ctx, kv.B().Subscribe().Channel(prefix+"lager:buchungen").Build(), func(m valkey.PubSubMessage) {
			var b Buchung
			if json.Unmarshal([]byte(m.Message), &b) == nil {
				log.Printf("Buchung von %s: %d × %s", b.Von, b.Menge, b.SKU)
			}
		})
		if err != nil {
			log.Printf("Abo beendet: %v", err)
		}
	}()

	http.HandleFunc("GET /artikel/{sku}", func(w http.ResponseWriter, r *http.Request) {
		s, err := kv.Do(r.Context(), kv.B().Get().Key(prefix+"artikel:"+r.PathValue("sku")).Build()).ToString()
		if valkey.IsValkeyNil(err) {
			http.Error(w, "nicht im Cache", http.StatusNotFound)
			return
		}
		var a Artikel
		if err != nil || json.Unmarshal([]byte(s), &a) != nil {
			http.Error(w, fmt.Sprint(err), http.StatusBadGateway)
			return
		}
		writeJSON(w, a)
	})

	http.HandleFunc("POST /buchen", func(w http.ResponseWriter, r *http.Request) {
		sku := r.URL.Query().Get("sku")
		menge, err := strconv.Atoi(r.URL.Query().Get("menge"))
		if sku == "" || err != nil {
			http.Error(w, "sku und menge fehlen", http.StatusBadRequest)
			return
		}
		ctx := r.Context()
		neu, err := kv.Do(ctx, kv.B().Incrby().Key(prefix+"bestand:"+sku).Increment(int64(-menge)).Build()).AsInt64()
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		// der @Cache von Lager.artikel ist jetzt veraltet: in allen Texo-Instanzen und in Kv leeren
		kv.Do(ctx, kv.B().Publish().Channel(prefix+"texo:cache-clear").Message("Lager.artikel").Build())
		b, _ := json.Marshal(Buchung{SKU: sku, Menge: menge, Von: "go"})
		kv.Do(ctx, kv.B().Publish().Channel(prefix+"lager:buchungen").Message(string(b)).Build())
		writeJSON(w, map[string]int64{"bestand": neu})
	})

	http.HandleFunc("GET /wer", func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie("tx_session")
		dot := -1
		if err == nil {
			dot = strings.LastIndex(c.Value, ".")
		}
		if dot < 0 {
			http.Error(w, "nicht angemeldet", http.StatusUnauthorized)
			return
		}
		// tx_session=<base64url(JSON)>.<Signatur>: die Kennung steht im Feld "i", die Werte liegen in Kv
		raw, _ := base64.RawURLEncoding.DecodeString(c.Value[:dot])
		var cookie struct {
			I string `json:"i"`
		}
		json.Unmarshal(raw, &cookie)
		s, err := kv.Do(r.Context(), kv.B().Get().Key(prefix+"texo:session:"+cookie.I).Build()).ToString()
		var session struct {
			Data map[string]string `json:"data"`
		}
		if err != nil || json.Unmarshal([]byte(s), &session) != nil {
			http.Error(w, "nicht angemeldet", http.StatusUnauthorized)
			return
		}
		writeJSON(w, session.Data)
	})

	addr := env("ADDR", ":8080")
	log.Printf("Go-Dienst auf %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func env(name, fallback string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return fallback
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
```

```texo [src/Lager.texo]
package lager

import texo.server.*

/// Ein Artikel mit Bestand. So steht er auch in Kv unter artikel:<sku>, der Go-Dienst liest ihn mit json.Unmarshal.
data class Artikel(sku: String, name: String, bestand: Int)

/// Eine Buchung: aus dem Browser (von: "texo") oder aus dem Go-Dienst (von: "go").
data class Buchung(sku: String, menge: Int, von: String)

/// Das Lager. Bestände liegen in Kv unter bestand:<sku>, Texo und der Go-Dienst zählen beide daran.
@Api("/api/lager")
service Lager {
    private let namen: Map<String, String> = ["A-1": "Säge", "A-2": "Hammer", "A-3": "Zange"]

    /// Buchungen beider Seiten: Kanal lager:buchungen in Kv (PUBLISH/SUBSCRIBE)
    private let buchungen: Channel<Buchung> = Channel(topic: "lager:buchungen", replay: 20)

    fn skus(): List<String> => this.namen.keys()

    /// Liegt als artikel:<sku> in Kv. Der Go-Dienst liest den Eintrag, und nach einer Buchung leert er ihn mit
    /// PUBLISH texo:cache-clear "Lager.artikel".
    @Cache(ttl: 10.min, shared: true, key: "artikel:{sku}")
    async fn artikel(sku: String): Artikel {
        let bestand = await Kv.get<Int>("bestand:${sku}") ?? 0
        return Artikel(sku, this.namen.get(sku) ?? "Unbekannt", bestand)
    }

    /// Bucht aus dem Browser: zählt den Bestand herunter, leert den Cache und meldet es an alle (auch an Go).
    @Invalidates(Lager.artikel)
    async fn buchen(sku: String, menge: Int): Int {
        if (!this.namen.has(sku)) throw HttpError(404, "Unbekannter Artikel ${sku}")
        let neu = await Kv.increment("bestand:${sku}", by: -menge)
        this.buchungen.send(Buchung(sku, menge, "texo"))
        return neu
    }

    fn live(): Stream<Buchung> => this.buchungen.stream()

    /// Mit TEXO_KV_SESSIONS=1 liest der Go-Dienst diese Sitzung über das Cookie tx_session.
    fn anmelden(name: String): Void => this.request.session.set("name", name.trim())
    fn ich(): String? => this.request.session.get("name")
    fn abmelden(): Void => this.request.session.clear()
}
```

```texo [src/Seite.texo]
package lager

import texo.ui.*
import texo.graphics.*

@Page(title: "Lager", path: "index.html")
component LagerSeite {
    private State<List<Artikel>> artikel = State([])
    private State<List<Buchung>> buchungen = State([])
    private State<String> name = State("")
    private State<String> ich = State("")

    async fn onMount(): Void {
        // Buchungen aus dem Browser und aus dem Go-Dienst kommen hier live an
        Lager.live().onEach(b => this.gebucht(b))
        this.ich.value = (await Lager.ich()) ?? ""
        await this.laden()
    }

    async fn laden(): Void {
        let liste: List<Artikel> = []
        for (sku in await Lager.skus()) {
            liste.add(await Lager.artikel(sku))
        }
        this.artikel.value = liste
    }

    async fn gebucht(b: Buchung): Void {
        this.buchungen.value.insert(0, b)
        await this.laden()
    }

    async fn anmelden(): Void {
        await Lager.anmelden(this.name.value)
        this.ich.value = (await Lager.ich()) ?? ""
    }

    fn build(): View {
        return Column(spacing: 16.px, [
            Heading("Lager", level: 1),
            Text(this.ich.value.isEmpty() ? "Nicht angemeldet" : "Angemeldet als ${this.ich.value} (der Go-Dienst sieht das unter /wer)"),
            Row(spacing: 8.px, [
                Input(bind: this.name, placeholder: "Name").testId("name"),
                Button("Anmelden").onClick(() => this.anmelden()).testId("anmelden")
            ]),
            Column(spacing: 8.px, this.artikel.value.map(a => Row(spacing: 12.px, [
                Text("${a.name} (${a.sku})").width(160.px),
                Text("Bestand: ${a.bestand}").testId("bestand-${a.sku}"),
                Button("1 buchen").onClick(() => Lager.buchen(a.sku, 1)).testId("buchen-${a.sku}")
            ]))),
            Heading("Buchungen", level: 2),
            Column(spacing: 4.px, this.buchungen.value.map(b => Text("${b.von}: ${b.menge} × ${b.sku}")))
        ]).padding(32.px).maxWidth(640.px)
    }
}
```

```json [texo.json]
{
  "src": "src",
  "out": "dist",
  "backend": "texo",
  "server": { "port": 3000 },
  "cluster": { "bus": "kv" }
}
```

:::

package scramblednotes

import (
	"fmt"
	"net/http"
)

func init() {
	http.HandleFunc("/sync", sync)
	http.HandleFunc("/chunk", chunk)
}

func sync(w http.ResponseWriter, r *http.Request) {
	// Compare client freshness with server freshness.
	// Serve the delta.
	fmt.Fprint(w, "TODO")
}

func chunk(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		// Serve chunk according to GET params.
		fmt.Fprint(w, "TODO")
	case "PUT":
		// Update a client-computed chunk.
		// Remember to check a version ID for coherence.
		fmt.Fprint(w, "TODO")
	}
}

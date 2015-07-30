package scramblednotes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

func init() {
	http.HandleFunc("/sync", sync)
	http.HandleFunc("/chunk", chunk)
	http.HandleFunc("/note", note)
}

// Response is a generic container suitable to be directly converted into a JSON HTTP response.
// See http://nesv.blogspot.fr/2012/09/super-easy-json-http-responses-in-go.html
// Strings and number are encoded as expected in their respective JSON type.
// A []byte will be encoded in base64.
type Response map[string]interface{}

func (r Response) String() (s string) {
	b, err := json.Marshal(r)
	if err != nil {
		panic(err)
	}
	s = string(b)
	return
}

func sync(w http.ResponseWriter, r *http.Request) {
	// Compare client freshness with server freshness.
	// Serve the delta.
	clientDataVersion := r.FormValue("clientDataVersion")
	if clientDataVersion == globalDataVersion() {
		// Notes already up-to-date.
		// I would have used code 304 but it's not very idiomatic in XHR
		fmt.Fprint(w, Response{"success": true, "newContent": false, "globalDataVersion": globalDataVersion()})
		return
	}
	// TODO in JSON: somehow give the delta...
	fmt.Fprint(w, Response{"success": true, "newContent": true, "globalDataVersion": globalDataVersion()})
}

func chunk(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		// Serve chunk according to GET params.
		fmt.Fprint(w, "TODO")
	case "PUT":
		// Update a client-computed chunk.
		// Remember to check a version ID for coherence.
		r.FormValue("period")
		fmt.Fprint(w, "TODO")
	}
}

// CRUD for a single Note
func note(w http.ResponseWriter, r *http.Request) {
	idStr := r.FormValue("id")
	idInt, _ := strconv.Atoi(idStr)
	id := NoteID(idInt)

	switch r.Method {
	case "GET":
		// TODO unmock
		note, exists := mock.notes[id]
		if !exists {
			w.WriteHeader(404)
			fmt.Fprint(w, Response{"success": false, "message": "Not found."})
			return
		}
		fmt.Fprint(w, Response{"success": true, "note": note})
	case "POST":
		// New Note (no id yet)
		id = generateNewNoteID()
		ciphertext := r.FormValue("ciphertext")
		note := Note{
			ID:         id,
			OriginalID: id,
			Alive:      true,
			Data:       Ciphertext(ciphertext),
		}
		// TODO unmock
		mock.notes[id] = note
		mock.touchGlobalVersion()
		fmt.Fprint(w, Response{"success": true, "note": note, "globalDataVersion": globalDataVersion()})
	case "PUT":
		// Update a Note.
		// TODO better think about coherent design fo Note.ID, Note.OriginalID
		fmt.Fprint(w, "TODO")
		_ = id
	case "DELETE":
		fmt.Fprint(w, "TODO")
	}

	_ = id
}

func globalDataVersion() string {
	// TODO unmock
	return mock.globalDataVersion
}

func generateNewNoteID() NoteID {
	// TODO unmock
	return mock.generateNewNoteID()
}

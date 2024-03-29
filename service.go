package scramblednotes

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"appengine"
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
	c := appengine.NewContext(r)

	notebookIDStr := r.FormValue("nbid")
	notebookID, err := strconv.ParseInt(notebookIDStr, 10, 64)
	if err != nil {
		w.WriteHeader(400)
		fmt.Fprint(w, Response{"success": false, "message": "Bad parameter nbid=" + notebookIDStr})
		return
	}
	period := r.FormValue("period")

	switch r.Method {

	case "GET":
		// Serve chunk according to GET params.
		_, chunk, err := getNoteChunk(c, notebookID, period)
		if err != nil {
			w.WriteHeader(500) // or better http code?
			fmt.Fprint(w, Response{"success": false, "message": err.Error()})
			return
		}
		fmt.Fprint(w, Response{"success": true, "chunk": chunk, "globalDataVersion": globalDataVersion()})

	case "PUT":
		// Update a client-computed chunk.
		// Remember to check a version ID for coherence.
		dataB64 := r.FormValue("scrambleddata")
		data, err := base64.StdEncoding.DecodeString(dataB64)
		if err != nil {
			w.WriteHeader(400)
			fmt.Fprint(w, Response{"success": false, "message": err.Error()})
			return
		}
		chunk := NoteChunk{
			NotebookID: notebookID,
			Period:     period,
			Data:       Ciphertext(data),
		}
		_, err = saveChunk(c, chunk)
		if err != nil {
			w.WriteHeader(500) // or better http code?
			fmt.Fprint(w, Response{"success": false, "message": err.Error()})
			return
		}
		fmt.Fprint(w, Response{"success": true, "globalDataVersion": globalDataVersion()})
	}
}

// CRUD for a single Note
func note(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	idStr := r.FormValue("id")
	idInt, _ := strconv.Atoi(idStr)
	id := NoteID(idInt)

	switch r.Method {
	case "GET":
		// TODO unmock
		note, exists := mock.notes[id]
		if !exists {
			c.Errorf("Note %v not found.", id)
			w.WriteHeader(404)
			fmt.Fprint(w, Response{"success": false, "message": "Not found."})
			return
		}
		c.Infof("Serving note %s with cypher content %v", note.ID, note.Data)
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
		c.Infof("Storing new note %v with cypher content %v", note.ID, ciphertext)
		// TODO unmock
		mock.notes[id] = note
		mock.touchGlobalVersion()
		fmt.Fprint(w, Response{"success": true, "note": note, "globalDataVersion": globalDataVersion()})
	case "PUT":
		// Update a Note.
		// TODO better think about coherent design for Note.ID, Note.OriginalID
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

package scramblednotes

import "appengine"
import "appengine/datastore"
import "time"

func getNoteChunk(c appengine.Context, notebookID int64, period string) (*datastore.Key, NoteChunk, error) {
	var chunk NoteChunk
	notebookKey := datastore.NewKey(c, "Notebook", "", notebookID, nil)
	chunkKey := datastore.NewKey(c, "NoteChunk", period, 0, notebookKey)
	err := datastore.Get(c, chunkKey, &chunk)
	return chunkKey, chunk, err
}

func saveChunk(c appengine.Context, chunk NoteChunk) (*datastore.Key, error) {
	notebookKey := datastore.NewKey(c, "Notebook", "", chunk.NotebookID, nil)
	chunkKey := datastore.NewKey(c, "NoteChunk", chunk.Period, 0, notebookKey)
	now := time.Now()
	chunk.LastSaved = now
	c.Infof("Saving entry %v", chunkKey)
	return datastore.Put(c, chunkKey, &chunk)
}

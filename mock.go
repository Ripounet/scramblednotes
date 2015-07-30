package scramblednotes

import (
	"math/rand"
	"strconv"
	"time"
)

var mock = struct {
	note               Note
	notes              map[NoteID]Note
	globalDataVersion  string
	touchGlobalVersion func()
	generateNewNoteID  func() NoteID
}{
	note: Note{
		ID:         123,
		OriginalID: 123,
		Alive:      true,
		Data:       Ciphertext("abcde"),
	},

	notes: map[NoteID]Note{},

	globalDataVersion: "1",

	generateNewNoteID: func() NoteID {
		i := rand.Intn(999999)
		return NoteID(i)
	},
}

func init() {
	mock.notes[123] = mock.note
	mock.touchGlobalVersion = func() {
		mock.globalDataVersion = "v" + randomString()
	}
	mock.touchGlobalVersion()

	// Not the same sequence after each server restart
	rand.Seed(time.Now().UnixNano())
}

func randomString() string {
	i := rand.Intn(999999999)
	return strconv.Itoa(i)
}

package scramblednotes

import "math/rand"

var mock = struct {
	note              Note
	notes             map[NoteID]Note
	generateNewNoteID func() NoteID
}{
	note: Note{
		ID:         123,
		OriginalID: 123,
		Alive:      true,
		Data:       Ciphertext("abcde"),
	},

	notes: map[NoteID]Note{},

	generateNewNoteID: func() NoteID {
		i := rand.Intn(999999)
		return NoteID(i)
	},
}

func init() {
	mock.notes[123] = mock.note
}

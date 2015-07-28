package scramblednotes

// A Note is a small piece of text, typed or pasted by the user.
// It is the most important entity of the Scrambled Notes application.
type Note struct {
	// ID of this version of this Note.
	// IDs are unique inside a notebook.
	// Note versions are read-only, which mean successive versions of a Note have distinct IDs.
	ID NoteID

	// OriginalID was the ID of the first version of this note, when it was created.
	OriginalID NoteID
	// TODO make sure ID, OriginalID would not be better replaced by ID, Version ...

	// Alive is true when this version is the last version for this OriginalID.
	// Alive is false when this version exists only in history, and a newer version exists.
	Alive bool

	// Data hold the encrypted textual content
	Data Ciphertext

	// List of files attached to this Note.
	AttachmentHashes []FileHash
}

// NoteID is the type of the ID of a Note. Not really sure yet about the underlying type.
type NoteID int

// A Ciphertext is scrambled data.
// It should not be decrypted server-side.
type Ciphertext []byte

// FileHash is the SHA1 hash of the encrypted content of an Attachment.
// In accordance with crypto/sha1, it consists in 20 bytes.
type FileHash [20]byte

// An Attachment is encrypted and lives in a global space, where it
// is accessed through the SHA1 of its encrypted content.
type Attachment struct {
	// Hash is the Attachment logical key, because the Attachment space is content-addressable.
	Hash FileHash

	// Filename is the (encrypted) original filename of the Attachment.
	Filename Ciphertext

	// Data is the (encrypted) file content of the Attachment.
	Data Ciphertext
}

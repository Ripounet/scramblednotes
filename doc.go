// scramblednotes is an online notepad.
//
// It is intended to be fast, reasonably secure, and to provide a few offline features.
//
// It works with a server, but the web hosting service must not have access to the user data, so the
// server sees only opaque chunks of data. To keep this restriction simple the server cannot perform textual search.
//
// The client sides on the other hand should download as much of the data as possible, preferably all of the user
// data aggregated over time, and keep it in local cach. Then, a HTML5 UI is responsible for decrypting the
// notes content and provide textual search facility. It must also encrypt new data before sending to server.
//
// When an internet connection is not available, the user should still be able to perform any read operation
// (including textual search) on the data previously downloaded on the client. She should also be able to
// create a new note or update an existing note, which will be synchronized later.
package scramblednotes

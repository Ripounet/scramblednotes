

var NoteBox = React.createClass({
  render: function() {
    return (
      <div className="noteBox">
        I am a Note.
      </div>
    );
  }
});

for(var i=0;i<4;i++){
ReactDOM.render(
  <NoteBox />,
  document.getElementById('listzone')
);
}
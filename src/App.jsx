import { useEffect, useState } from "react";
import loginServer from "./services/login";
import Note from "./components/Note";
import noteService from "./services/notes";
import Notification from "./components/Notification";
import LoginForm from "./components/LoginForm";
import NoteForm from "./components/NoteForm";
import Footer from "./components/Footer";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("a new note...");
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  //toggles if show only important notes
  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      noteService.setToken(user.token);
    }
  }, []);

  //get notes data from notes backend on first render
  useEffect(() => {
    noteService.getAll().then((initialNotes) => {
      setNotes(initialNotes);
    });
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginServer.login({
        username,
        password,
      });
      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      noteService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
    } catch (execption) {
      setErrorMessage("Wrong credentials");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  //toggle the importance of single note to false or true
  const toggleImportanceOf = (id) => {
    const note = notes.find((n) => n.id === id);
    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then((returnedNote) => {
        setNotes(notes.map((note) => (note.id === id ? returnedNote : note)));
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage(
          `Note "${note.content}" was already removed from server`
        );
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);

        setNotes(notes.filter((note) => note.id !== id));
      });
  };

  //Add new note to notes state and as well to backend
  const addNote = (e) => {
    e.preventDefault();

    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5,
    };

    noteService.create(noteObject).then((returnedNote) => {
      setNotes(notes.concat(returnedNote));
      setNewNote("");
    });
  };

  //handles input
  const handleNoteChange = (e) => {
    setNewNote(e.target.value);
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedNoteAppUser");
    setUser(null);
  };

  return (
    <div>
      <h1>Notes</h1>
      {errorMessage && <Notification message={errorMessage} />}

      {!user && (
        <LoginForm
          username={username}
          password={password}
          handleLogin={handleLogin}
          setUsername={setUsername}
          setPassword={setPassword}
        />
      )}
      {user && (
        <div>
          <p>{user.name} logged in</p>
          <button onClick={handleLogout}>Logout</button>
          <NoteForm
            newNote={newNote}
            addNote={addNote}
            handleNoteChange={handleNoteChange}
          />
        </div>
      )}

      <h2>Notes</h2>

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          Show: {showAll ? "All" : "Important only"}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Note
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
            key={note.id}
          />
        ))}
      </ul>

      <Footer />
    </div>
  );
};

export default App;

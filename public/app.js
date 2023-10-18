const addBox = document.querySelector(".add-box"),
  popupBox = document.querySelector(".popup-box"),
  popupTitle = popupBox.querySelector("header p"),
  closeIcon = popupBox.querySelector("header i"),
  titleTag = popupBox.querySelector("input"),
  descTag = popupBox.querySelector("textarea"),
  addBtn = popupBox.querySelector("button");

// Agrego los meses en las notas
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// informacion notas almacenadas en el localStorage
const notes = JSON.parse(localStorage.getItem("notes") || "[]");
let isUpdate = false,
  updateId;

//conectar al servidor Socket.IO
const socket = io();

addBox.addEventListener("click", () => {
  popupTitle.innerText = "Agregar Nota nueva";
  addBtn.innerText = "Agregar Nota";
  popupBox.classList.add("show");
  document.querySelector("body").style.overflow = "hidden";
  if (window.innerWidth > 660) titleTag.focus();
});

closeIcon.addEventListener("click", () => {
  isUpdate = false;
  titleTag.value = descTag.value = "";
  popupBox.classList.remove("show");
  document.querySelector("body").style.overflow = "auto";
});

// Recorre las notas existentes y las muestra en la interfaz de usuario.
function showNotes() {
  if (!notes) return;
  document.querySelectorAll(".note").forEach((li) => li.remove());
  notes.forEach((note, id) => {
    let filterDesc = note.description.replaceAll("\n", "<br/>");
    let liTag = `<li class="note">
                        <div class="details">
                            <p>${note.title}</p>
                            <span>${filterDesc}</span>
                        </div>
                        <div class="bottom-content">
                            <span>${note.date}</span>
                            <div class="settings">
                                <i onclick="showMenu(this)" class="uil uil-ellipsis-h"></i>
                                <ul class="menu">
                                    <li onclick="updateNote(${id}, '${note.title}', '${filterDesc}')"><i class="uil uil-pen"></i>Editar</li>
                                    <li onclick="deleteNote(${id})"><i class="uil uil-trash"></i>Eliminar</li>
                                </ul>
                            </div>
                        </div>
                    </li>`;
    addBox.insertAdjacentHTML("afterend", liTag);
  });
}
showNotes();

function showMenu(elem) {
  elem.parentElement.classList.add("show");
  document.addEventListener("click", (e) => {
    if (e.target.tagName != "I" || e.target != elem) {
      elem.parentElement.classList.remove("show");
    }
  });
}

function deleteNote(noteId) {
  notes.splice(noteId, 1);
  // Emitir la eliminación de la nota al servidor
  socket.emit("deleteNote", noteId);
  localStorage.setItem("notes", JSON.stringify(notes));
  showNotes();
}

function updateNote(noteId, title, filterDesc) {
  let description = filterDesc.replaceAll("<br/>", "\r\n");
  updateId = noteId;
  isUpdate = true;
  addBox.click();
  titleTag.value = title;
  descTag.value = description;
  popupTitle.innerText = "Actualizar Nota";
  addBtn.innerText = "Actualizar Nota";
}

addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let title = titleTag.value.trim(),
    description = descTag.value.trim();

  if (title || description) {
    let currentDate = new Date(),
      month = months[currentDate.getMonth()],
      day = currentDate.getDate(),
      year = currentDate.getFullYear();

    let noteInfo = {
      title,
      description,
      date: `${month} ${day}, ${year}`,
    };
    if (!isUpdate) {
      notes.push(noteInfo);
      // Emitir la nueva nota al servidor
      socket.emit("newNote", noteInfo);
    } else {
      isUpdate = false;
      notes[updateId] = noteInfo;
      // Emitir la actualización de la nota al servidor
      socket.emit("updateNote", { id: updateId, note: noteInfo });
    }
    localStorage.setItem("notes", JSON.stringify(notes));
    showNotes();
    closeIcon.click();
  }
});

// Escuchar eventos del servidor para recibir nuevas notas, actualizaciones y eliminaciones
socket.on("newNote", (note) => {
  notes.push(note);

  showNotes();
});

socket.on("updateNote", (data) => {
  const { id, note } = data;
  notes[id] = note;
  showNotes();
});

socket.on("deleteNote", (noteId) => {
  notes.splice(noteId, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  showNotes();
});

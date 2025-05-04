let alumnos = cargarAlumnos();
const listaAlumnosElement = document.getElementById('lista-alumnos');
const tituloListaAlumnos = document.getElementById('titulo-lista-alumnos');
const alumnoCalificacionSelect = document.getElementById('alumno-calificacion');
const consultarAlumnoSelect = document.getElementById('consultar-alumno');
const eliminarAlumnoSelect = document.getElementById('eliminar-alumno');
const editarAlumnoSelect = document.getElementById('editar-alumno');
const editarMateriaSelect = document.getElementById('editar-materia');
const nuevaCalificacionInput = document.getElementById('nueva-calificacion');
const detallesAlumnoDiv = document.getElementById('detalles-alumno');
const mensajeEliminacionDiv = document.getElementById('mensaje-eliminacion');
const mensajeEdicionDiv = document.getElementById('mensaje-edicion');

function guardarAlumnos() {
    localStorage.setItem('alumnos', JSON.stringify(alumnos));
}

function cargarAlumnos() {
    const datosGuardados = localStorage.getItem('alumnos');
    return datosGuardados ? JSON.parse(datosGuardados) : [];
}

function agregarAlumno() {
    const nombreInput = document.getElementById('nombre-alumno');
    const nombre = nombreInput.value.trim();

    if (nombre) {
        const nuevoAlumno = {
            nombre: nombre,
            calificaciones: {}
        };
        alumnos.push(nuevoAlumno);
        guardarAlumnos();
        actualizarListaAlumnos();
        actualizarSelectConsultar();
        actualizarSelectEliminar();
        actualizarSelectEditarAlumno();
        nombreInput.value = '';
    } else {
        alert('Por favor, ingresa el nombre del alumno.');
    }
}

function registrarCalificacion() {
    const alumnoSelect = document.getElementById('alumno-calificacion');
    const materiaInput = document.getElementById('materia');
    const calificacionInput = document.getElementById('calificacion');

    const alumnoNombre = alumnoSelect.value;
    const materia = materiaInput.value.trim();
    const calificacion = parseFloat(calificacionInput.value);

    if (alumnoNombre && materia && !isNaN(calificacion) && calificacion >= 0 && calificacion <= 10) {
        const alumno = alumnos.find(alumno => alumno.nombre === alumnoNombre);
        if (alumno) {
            alumno.calificaciones[materia] = calificacion;
            guardarAlumnos();
            actualizarListaAlumnos();
            actualizarMateriasEditar();
            materiaInput.value = '';
            calificacionInput.value = '';
        }
    } else {
        alert('Por favor, selecciona un alumno, ingresa la materia y una calificación válida (0-10).');
    }
}

function calcularPromedio(calificaciones) {
    if (Object.keys(calificaciones).length === 0) {
        return 'Sin calificaciones';
    }
    const suma = Object.values(calificaciones).reduce((total, cal) => total + cal, 0);
    return (suma / Object.keys(calificaciones).length).toFixed(2);
}

function mostrarDetallesAlumno() {
    const alumnoNombre = consultarAlumnoSelect.value;
    const alumno = alumnos.find(alumno => alumno.nombre === alumnoNombre);

    if (alumno) {
        let detallesHTML = `<h3>Detalles de ${alumno.nombre}</h3>`;
        const calificacionesHTML = Object.entries(alumno.calificaciones)
            .map(([materia, calificacion]) => `<p>${materia}: ${calificacion}</p>`)
            .join('');

        detallesHTML += calificacionesHTML || '<p>Sin calificaciones registradas.</p>';
        detallesHTML += `<p><strong>Promedio:</strong> ${calcularPromedio(alumno.calificaciones)}</p>`;
        detallesAlumnoDiv.innerHTML = detallesHTML;
    } else {
        detallesAlumnoDiv.innerHTML = '<p>Alumno no encontrado.</p>';
    }
}

function eliminarAlumno() {
    const alumnoNombreAEliminar = eliminarAlumnoSelect.value;
    const indice = alumnos.findIndex(alumno => alumno.nombre === alumnoNombreAEliminar);

    if (indice !== -1) {
        alumnos.splice(indice, 1);
        guardarAlumnos();
        actualizarListaAlumnos();
        actualizarSelectConsultar();
        actualizarSelectEliminar();
        actualizarSelectEditarAlumno();
        mensajeEliminacionDiv.textContent = `El alumno '${alumnoNombreAEliminar}' ha sido eliminado.`;
    } else {
        mensajeEliminacionDiv.textContent = `No se encontró al alumno '${alumnoNombreAEliminar}'.`;
    }

    eliminarAlumnoSelect.value = "";
}

function actualizarMateriasEditar() {
    const alumnoNombreEditar = editarAlumnoSelect.value;
    const alumno = alumnos.find(alumno => alumno.nombre === alumnoNombreEditar);
    editarMateriaSelect.innerHTML = '<option value="">Seleccionar materia</option>';

    if (alumno && alumno.calificaciones) {
        for (const materia in alumno.calificaciones) {
            if (alumno.calificaciones.hasOwnProperty(materia)) {
                const option = document.createElement('option');
                option.value = materia;
                option.textContent = materia;
                editarMateriaSelect.appendChild(option);
            }
        }
    }
}

function cambiarCalificacion() {
    const alumnoNombreEditar = editarAlumnoSelect.value;
    const materiaSeleccionada = editarMateriaSelect.value;
    const nuevaCalificacion = parseFloat(nuevaCalificacionInput.value);

    if (alumnoNombreEditar && materiaSeleccionada && !isNaN(nuevaCalificacion) && nuevaCalificacion >= 0 && nuevaCalificacion <= 10) {
        const alumno = alumnos.find(alumno => alumno.nombre === alumnoNombreEditar);
        if (alumno && alumno.calificaciones.hasOwnProperty(materiaSeleccionada)) {
            alumno.calificaciones[materiaSeleccionada] = nuevaCalificacion;
            guardarAlumnos();
            actualizarListaAlumnos();
            mostrarMensajeEdicion(`Calificación de '${materiaSeleccionada}' para '${alumnoNombreEditar}' actualizada a ${nuevaCalificacion}.`, 'success');
            nuevaCalificacionInput.value = '';
        } else {
            mostrarMensajeEdicion('No se pudo actualizar la calificación. Verifica el alumno y la materia.', 'error');
        }
    } else {
        mostrarMensajeEdicion('Por favor, selecciona un alumno, una materia e ingresa una calificación válida (0-10).', 'warning');
    }
}

function eliminarMateria() {
    const alumnoNombreEditar = editarAlumnoSelect.value;
    const materiaAEliminar = editarMateriaSelect.value;

    if (alumnoNombreEditar && materiaAEliminar) {
        const alumno = alumnos.find(alumno => alumno.nombre === alumnoNombreEditar);
        if (alumno && alumno.calificaciones.hasOwnProperty(materiaAEliminar)) {
            delete alumno.calificaciones[materiaAEliminar];
            guardarAlumnos();
            actualizarListaAlumnos();
            actualizarMateriasEditar();
            mostrarMensajeEdicion(`La materia '${materiaAEliminar}' de '${alumnoNombreEditar}' ha sido eliminada.`, 'success');
        } else {
            mostrarMensajeEdicion('No se encontró la materia para el alumno seleccionado.', 'error');
        }
    } else {
        mostrarMensajeEdicion('Por favor, selecciona un alumno y una materia para eliminar.', 'warning');
    }
}

function mostrarMensajeEdicion(mensaje, tipo) {
    mensajeEdicionDiv.textContent = mensaje;
    mensajeEdicionDiv.className = tipo;
    setTimeout(() => {
        mensajeEdicionDiv.textContent = '';
        mensajeEdicionDiv.className = '';
    }, 3000);
}

function actualizarListaAlumnos() {
    listaAlumnosElement.innerHTML = '';
    alumnoCalificacionSelect.innerHTML = '<option value="">Seleccionar alumno</option>';
    consultarAlumnoSelect.innerHTML = '<option value="">Seleccionar alumno</option>';
    eliminarAlumnoSelect.innerHTML = '<option value="">Seleccionar alumno</option>';
    editarAlumnoSelect.innerHTML = '<option value="">Seleccionar alumno</option>';

    const alumnosOrdenados = [...alumnos].sort((a, b) => a.nombre.localeCompare(b.nombre));

    alumnosOrdenados.forEach(alumno => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span class="alumno-info">${alumno.nombre}:</span> `;

        const calificacionesArray = Object.entries(alumno.calificaciones);
        if (calificacionesArray.length > 0) {
            const calificacionesText = calificacionesArray
                .map(([materia, calificacion]) => `${materia}: ${calificacion}`)
                .join(', ');
            listItem.innerHTML += `<span class="calificaciones">(${calificacionesText})</span>`;
        } else {
            listItem.innerHTML += `<span class="calificaciones">(Sin calificaciones)</span>`;
        }
        listaAlumnosElement.appendChild(listItem);

        const optionCalificacion = document.createElement('option');
        optionCalificacion.value = alumno.nombre;
        optionCalificacion.textContent = alumno.nombre;
        alumnoCalificacionSelect.appendChild(optionCalificacion);

        const optionConsultar = document.createElement('option');
        optionConsultar.value = alumno.nombre;
        optionConsultar.textContent = alumno.nombre;
        consultarAlumnoSelect.appendChild(optionConsultar);

        const optionEliminar = document.createElement('option');
        optionEliminar.value = alumno.nombre;
        optionEliminar.textContent = alumno.nombre;
        eliminarAlumnoSelect.appendChild(optionEliminar);

        const optionEditar = document.createElement('option');
        optionEditar.value = alumno.nombre;
        optionEditar.textContent = alumno.nombre;
        editarAlumnoSelect.appendChild(optionEditar);
    });
}

function actualizarSelectConsultar() {
    consultarAlumnoSelect.innerHTML = '<option value="">Seleccionar alumno</option>';
    const alumnosOrdenados = [...alumnos].sort((a, b) => a.nombre.localeCompare(b.nombre));
    alumnosOrdenados.forEach(alumno => {
        const option = document.createElement('option');
        option.value = alumno.nombre;
        option.textContent = alumno.nombre;
        consultarAlumnoSelect.appendChild(option);
    });
}

function actualizarSelectEliminar() {
    eliminarAlumnoSelect.innerHTML = '<option value="">Seleccionar alumno</option>';
    const alumnosOrdenados = [...alumnos].sort((a, b) => a.nombre.localeCompare(b.nombre));
    alumnosOrdenados.forEach(alumno => {
        const option = document.createElement('option');
        option.value = alumno.nombre;
        option.textContent = alumno.nombre;
        eliminarAlumnoSelect.appendChild(option);
    });
}

function actualizarSelectEditarAlumno() {
    editarAlumnoSelect.innerHTML = '<option value="">Seleccionar alumno</option>';
    const alumnosOrdenados = [...alumnos].sort((a, b) => a.nombre.localeCompare(b.nombre));
    alumnosOrdenados.forEach(alumno => {
        const option = document.createElement('option');
        option.value = alumno.nombre;
        option.textContent = alumno.nombre;
        editarAlumnoSelect.appendChild(option);
    });
}

function toggleListaAlumnos() {
    const lista = listaAlumnosElement;
    lista.style.display = lista.style.display === 'none' ? 'block' : 'none';
}

// Inicializar la lista al cargar la página
actualizarListaAlumnos();
actualizarSelectEditarAlumno();
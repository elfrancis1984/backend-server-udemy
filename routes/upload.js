var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccion no es valida',
            error: { message: 'tipo de coleccion no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            error: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones validas
    var extesionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extesionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            error: { message: 'Las extensiones validas son ' + extesionesValidas.join(', ') }
        });
    }

    // Nombre del archivo
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover archivo
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }

        subirPorIpo(tipo, id, nombreArchivo, res);

    });

});

function subirPorIpo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    error: { message: err }
                });
            }

            var pathAnterior = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    error: { message: err }
                });
            }
            var pathAnterior = './uploads/medicos/' + medico.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    error: { message: err }
                });
            }
            var pathAnterior = './uploads/hospitales/' + hospital.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada',
                    hospital: hospital
                });
            });
        });
    }
}

module.exports = app;
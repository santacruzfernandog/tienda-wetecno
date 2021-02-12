import React from 'react'
import {db, storage} from './firebase'
//import {nanoid} from 'nanoid'

function App() {

  const [error, setError] = React.useState(false)
  var [uploadValue, setUploadValue] = React.useState(0)
  const [productos, setProductos] = React.useState([])
  const [producto, setProducto] = React.useState({
    nombre: '',
    categoria: '',
    precio: 0,
    descripcion: '',
    imagen: '',
    modelo: '',
    color: '',
    marca: '',
    arrayImagen: []
  })

  const [modoEdicion, setModoEdicion] = React.useState(false)
  const [id, setId] = React.useState('')
  const [uploadImages, setUploadImages] = React.useState([])
  const [uploadImg, setUploadImg] = React.useState('')

  React.useEffect(()=> {

    const obtenerDatos = async ()=> {
      try{
        const data = await db.collection('productos').get()
        const arrayData = data.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setProductos(arrayData)

      } catch(error){
        console.log(error)
      }
    }
    obtenerDatos()

    const mergeArrayImagen = async()=> {
      try {
        await db.collection('productos').doc(id).set({
          arrayImagen: uploadImages
      }, { merge: true })
      } catch (error) {
        console.log('Error en la funcion "mergeArrayImagen"')
      }
    }
    mergeArrayImagen()
  }, [id, uploadImages])

  
  const mostrarImagenes = async(unId)=> {
    try {
      setUploadImages([])
      const data = await db.collection('productos').doc(unId).get()
      const arrayData = await data.data().arrayImagen
      const imgLinks = await arrayData.map(img => storage.ref(`/productos/arrayProductos/${unId}/${img}`).getDownloadURL())

      Promise.all(imgLinks).then(res => setUploadImages(res))

    } catch (error) {
      console.log(error)
    }
  }

  const showImages = async(id)=>{
    await mostrarImagenes(id)
  }

  function subirImagen(event){
    const nuevaImagen = event.target.files[0]
    const imagePNG = 'image/png'
    const imageJPG = 'image/jpg'
    const imageJPEG = 'image/jpeg'

    if(nuevaImagen.type === imagePNG || nuevaImagen.type === imageJPG || nuevaImagen.type === imageJPEG){
      const imagenRef = storage.ref(`/productos/portada/${nuevaImagen.name}`)
      var uploadImage = imagenRef.put(nuevaImagen)
  
      uploadImage.on('state_changed', snapshot => {
        var porcentaje = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadValue(porcentaje)
      }, error => {
        console.log(error)
      }, async()=> {
        setUploadValue(100)
      });

      setError(false)
    } else {
      setError(true)
      document.getElementById('form').reset()
      return
    }
    setError(false)
  }

  const agregar = async (event) => {
    event.preventDefault()
    /* if(!producto.trim()){            falta codear esto
      console.log('Esta vacio')
      return
    } */
    
    try{
      const nuevaImagen = event.target[0].files[0]
      const imagenGuardada = await storage.ref(`/productos/portada/${nuevaImagen.name}`).getDownloadURL()

      const nuevoProducto = {
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
        color: producto.color,
        descripcion: producto.descripcion,
        modelo: producto.modelo,
        marca: producto.marca,
        imagen: imagenGuardada
      }
      
      const data = await db.collection('productos').add(nuevoProducto)

      setProductos([...productos, {id: data.id, ...nuevoProducto}])

      setProducto({
        nombre: '',
        categoria: '',
        precio: 0,
        descripcion: '',
        imagen: '',
        modelo: '',
        color: '',
        marca: '',
      })

      setUploadValue(0)
      document.getElementById('form').reset()
    } catch(error) {
      console.log(error);
    }
  }

  const eliminar = async(id)=> {
    try{
      await db.collection('productos').doc(id).delete()

      const arrayFiltrado = productos.filter(prod => prod.id !== id)
      setProductos(arrayFiltrado)

    } catch(error) {
      console.log(error)
    }
  }

  const activarEdicion = (item) => {
    setModoEdicion(true)
    setProducto(item)
    setId(item.id)
  }

  const editar = async (e) => {
    e.preventDefault()
    /* if(!producto.trim()){                        falta codear esto
      console.log('Hay un campo vacio')
      return
    } */

    try{
      await db.collection('productos').doc(id).update({
        nombre: producto.nombre,
        categoria: producto.categoria,
        color: producto.color,
        descripcion: producto.descripcion,
        precio: producto.precio,
        modelo: producto.modelo,
        marca: producto.marca,
        imagen: producto.imagen
      })

      const arrayEditado = productos.map(item => (
        item.id === id ? {
          id: item.id,
          nombre: producto.nombre,
          categoria: producto.categoria,
          color: producto.color,
          descripcion: producto.descripcion,
          precio: producto.precio,
          modelo: producto.modelo,
          marca: producto.marca,
          imagen: producto.imagen
        } : item
      ))

      setProductos(arrayEditado)
      setModoEdicion(false)
      setProducto({
        nombre: '',
        categoria: '',
        precio: 0,
        descripcion: '',
        imagen: '',
        modelo: '',
        color: '',
        marca: ''
      })
      setId('')
      document.getElementById('form').reset()

    } catch(error) {
      console.log(error)
    }
  }

  const obtenerNombreDeArchivos = (e)=> {
    const arrayArchivos = Array.from(e.target.files)
    const arrayNombres = arrayArchivos.map(item => item.name)
    setUploadImages(arrayNombres)
  }

  const subirTodo = (event)=> {
    event.preventDefault()
    const arrayFiles = Array.from(event.target[0].files)
    arrayFiles.map(img =>
      storage.ref(`/productos/arrayProductos/${id}/${img.name}`).put(img)
    )

    document.getElementById('form_multi_img').reset()
    setId('')
  }

  const cerrar = ()=>{
    document.getElementById('form_multi_img').reset()
    setId('')
  }


  return (
    <div className="container-fluid mt-5">
      <h1 className="text-center">Tienda WeTecno</h1 >
      <hr/>
      <div className="row">
        <div className="col-md-9">
          <h5 className="text-center">Todos los productos</h5>          
          <div className="row">
            <div className="col">
                <table id="example" className="table table-sm table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Imagen</th>
                                    <th>Categoria</th>
                                    <th>Nombre</th>
                                    <th>Modelo</th>
                                    <th>Marca</th>
                                    <th>Precio</th>
                                    <th>Descripcion</th>
                                    <th>Color</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                  productos.map(item => (
                                    <tr key={item.id}>
                                        <td className="text-center"><a href="#arrayImagenes" onClick={()=> showImages(item.id)}><img src={item.imagen} alt="" width="50" data-toggle="modal" data-target="#arrayImagenes"/></a></td>
                                        <td>{item.categoria}</td>
                                        <td>{item.nombre}</td>
                                        <td>{item.modelo}</td>
                                        <td>{item.marca}</td>
                                        <td>{item.precio}</td>
                                        <td>{item.descripcion}</td>
                                        <td>{item.color}</td>
                                        <td className="text-center">
                                          <div className="btn-group btn-group-sm" role="group">
                                            <label
                                              className="btn btn-primary btn-sm m-0"
                                              data-toggle="modal"
                                              data-target="#subirImagenes"
                                              onClick={e=> setId(item.id)}
                                            >
                                              <i className="fas fa-plus"></i>
                                            </label>
                                            <button
                                              className="btn btn-warning btn-sm"
                                              onClick={ () => activarEdicion(item)}>
                                              <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                              className="btn btn-danger btn-sm"
                                              onClick={ () => eliminar(item.id)}>
                                              <i className="fas fa-trash-alt"></i>
                                            </button>
                                          </div>
                                        </td>
                                    </tr>
                                  ))
                                }
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </tfoot>
                </table> 
            </div>
          </div>
        </div>

        {/* Modal subir imagenes */}
        <div className="modal fade" id="subirImagenes" tabIndex="-1" role="dialog" aria-labelledby="subirImagenesLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h6 className="modal-title" id="subirImagenesLabel">Subir imagenes de este producto</h6>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    <div className="modal-body">
                      <form id="form_multi_img" onSubmit={e=> subirTodo(e)}>
                        <div className="form-froup">
                          <label htmlFor="multi_img">Seleccionar imagenes</label>
                          <input
                            multiple
                            type="file"
                            className="form-control-file"
                            id="multi_img"
                            onChange={ e => obtenerNombreDeArchivos(e)}
                          />
                        </div>
                        <div className="btn-group btn-group-sm float-right mt-4" role="group" aria-label="Basic example">
                          <button type="button" data-dismiss="modal" aria-label="Close" className="btn btn-secondary btn-sm" onClick={()=> cerrar()}>Cancelar</button>
                          <button type="submit" className="btn btn-primary btn-sm">Confirmar</button>
                        </div>
                      </form>
                    </div>
                </div>
            </div>
        </div>

        {/* Modal mostrar imagenes */}
        <div className="modal fade" id="arrayImagenes" tabIndex="-1" role="dialog" aria-labelledby="arrayImagenesLabel" aria-hidden="true">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h6 className="modal-title" id="arrayImagenesLabel">Imagenes de este producto</h6>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    <div className="modal-body">
                      <h5>{id}</h5>
                        {
                          uploadImages.map(img => 
                              <img src={img} key={img} width="150" className="m-2 img-thumbnail" alt=""/>
                          )
                        }
                    </div>
                </div>
            </div>
        </div>

        {/* Formulario */}
        <div className="col-md-3">
        <h5 className="text-center">
          {
            modoEdicion ? 'Editar producto' : 'Agregar producto'
          }
        </h5>
        <form id="form" onSubmit={modoEdicion ? editar : agregar}>

          {
            uploadImg ? ( <img src={uploadImg} className="mb-2" width="75" alt=""/> ) : null
          }

          { error &&
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <h6>Solo archivos .png, .jpg o .jpeg</h6>
              <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          }

          <div className="progress mb-3">
            <div className="progress-bar bg-success" style={{width: `${uploadValue}%`}}></div>
          </div>
          <input
            type="file"
            className="form-control form-control-sm mb-2"
            onChange={e => subirImagen(e)}
          />

          <input
            disabled={
              uploadValue === 100 || modoEdicion ? false : true
            }
            type="text"
            placeholder="Nombre del producto"
            className="form-control form-control-sm mb-2"
            onChange={e => setProducto({...producto, nombre: e.target.value})}
            value={producto.nombre}
          />

          <input
            disabled={
              uploadValue === 100 || modoEdicion ? false : true
            }
            type="text"
            placeholder="Categoria del producto"
            className="form-control form-control-sm mb-2"
            onChange={e => setProducto({...producto, categoria: e.target.value})}
            value={producto.categoria}
          />
          
          <input
            disabled={
              uploadValue === 100 || modoEdicion ? false : true
            }
            type="text"
            placeholder="Modelo del producto"
            className="form-control form-control-sm mb-2"
            onChange={e => setProducto({...producto, modelo: e.target.value})}
            value={producto.modelo}
          />
          
          <input
            disabled={
              uploadValue === 100 || modoEdicion ? false : true
            }
            type="text"
            placeholder="Marca del producto"
            className="form-control form-control-sm mb-2"
            onChange={e => setProducto({...producto, marca: e.target.value})}
            value={producto.marca}
          />

          <input
            disabled={
              uploadValue === 100 || modoEdicion ? false : true
            }
            type="number"
            step="any"
            placeholder="Precio del producto"
            className="form-control form-control-sm mb-2"
            onChange={e => setProducto({...producto, precio: e.target.value})}
            value={producto.precio}
          />
          
          <input
            disabled={
              uploadValue === 100 || modoEdicion ? false : true
            }
            type="text"
            placeholder="Descripcion del producto"
            className="form-control form-control-sm mb-2"
            onChange={e => setProducto({...producto, descripcion: e.target.value})}
            value={producto.descripcion}
          />
          
          <input
            disabled={
              uploadValue === 100 || modoEdicion ? false : true
            }
            type="text"
            placeholder="Color del producto"
            className="form-control form-control-sm mb-2"
            onChange={e => setProducto({...producto, color: e.target.value})}
            value={producto.color}
          />

          <button
            disabled={
              uploadValue === 100 || modoEdicion ? false : true
            }
            className={
              modoEdicion ? 'btn btn-warning btn-block btn-sm' : 'btn btn-dark btn-block btn-sm'
            }
            type="submit"
          >
            {
              modoEdicion ? 'Editar' : 'Agregar'
            }
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

export default App;

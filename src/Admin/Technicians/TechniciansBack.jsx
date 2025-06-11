import { useState, useEffect } from 'react'
import { RegisterModal } from './Register/RegisterModal'
import { UpdateModal } from './Update/Update'
import { DeleteModal } from './Delete/Delete'
import { ButtonBack } from '../UI/ButtonBack/ButtonBack'
import CardTechniciansBack from './Get/CardTechniciansBack'
import { buscarTecnicoPorCorreo } from './Get/Get'


export const TechniciansBack = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [tecnicos, setTecnicos] = useState([])
  const [refrescar, setRefrescar] = useState(false)

  async function fetchTecnicos() {
    try {
      const res = await fetch('https://redgas.onrender.com/TecnicoGetAll');
      if (!res.ok) throw new Error('Error al obtener técnicos');
      const data = await res.json();
      const tecnicosData = Array.isArray(data) ? data : (data.data || []);
      setTecnicos(tecnicosData);
    } catch (error) {
      setTecnicos([])
      console.error(error)
    }
  }

  useEffect(() => {
    fetchTecnicos()
  }, [])

  useEffect(() => {
    if (refrescar) {
      fetchTecnicos()
      setRefrescar(false)
    }
  }, [refrescar])

  // Para actualizar un técnico desde la tarjeta
  const handleUpdateClick = (tecnico) => {
    setShowUpdateModal(tecnico);
  };

  // Para eliminar un técnico desde la tarjeta
  const handleDeleteClick = (tecnico) => {
    setShowDeleteModal(tecnico);
  };

  // Para buscar técnicos por correo desde el input
  const [correoBusqueda, setCorreoBusqueda] = useState("");
const handleBuscarTecnico = async () => {
  if (!correoBusqueda.trim()) {
    fetchTecnicos(); // Si está vacío, muestra todos
    return;
  }

  try {
    const resultados = await buscarTecnicoPorCorreo(correoBusqueda);
    setTecnicos(resultados);
  } catch (error) {
    console.error(error);
    setTecnicos([]);
  }
};


  return (
    <div className="p-[20px] h-full flex flex-col gap-[20px]">
      <div className='NeoContainer_outset_TL flex flex-col w-fit p-[0_0_0_20px]'>
        <h1 className="font-bold text-[20px] text-[var(--main-color)]">Técnicos</h1>
        <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 mb-2">
          <input
            type="text"
            placeholder="Correo del técnico"
            value={correoBusqueda}
            onChange={e => setCorreoBusqueda(e.target.value)}
            className="outline-none px-2 py-1 w-[180px]"
          />
          <button
            onClick={handleBuscarTecnico}
            aria-label="Buscar técnico"
            className="text-gray-600 hover:text-gray-900"
          >🔍</button>
        </div>
        <div className="flex p-[20px] w-fit h-fit flex-wrap justify-center justify-self-center items-center gap-[20px]">
          <ButtonBack ClickMod={() => setShowRegisterModal(true)} Child="Registrar" />
          {/* Eliminar, Actualizar y Consultar removidos porque ya están en la card y el input de consulta ya existe */}
        </div>
      </div>
      {/* Sección de técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tecnicos.map(tecnico => (
          <CardTechniciansBack
            key={tecnico.id_tecnico || tecnico.correo_tecnico}
            tecnico={tecnico}
            setRefrescar={setRefrescar}
            onUpdateClick={handleUpdateClick}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>
      {/* Modales */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          setRefrescar={setRefrescar}
        />
      )}
      {typeof showUpdateModal === 'object' && showUpdateModal && (
        <UpdateModal
          onClose={() => setShowUpdateModal(false)}
          setRefrescar={setRefrescar}
          tecnicoCarta={showUpdateModal}
        />
      )}
      {typeof showDeleteModal === 'object' && showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          setRefrescar={setRefrescar}
          tecnicoCarta={showDeleteModal}
        />
      )}
    </div>
  )
}

export default TechniciansBack

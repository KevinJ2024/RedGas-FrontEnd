import { faUser, faTools, faPlug, faGears, faQuestion } from "@fortawesome/free-solid-svg-icons"
import { useState, useEffect, useRef, useCallback } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { Buttons } from "../../UI/Login_Register/Buttons"
import { BtnBack } from "../../UI/Login_Register/BtnBack"
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import withReactContent from 'sweetalert2-react-content'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Accordion from '@mui/material/Accordion'
import Modal from '@mui/material/Modal'
import emailjs from '@emailjs/browser'
import Box from '@mui/material/Box'
import Swal from 'sweetalert2'
import './CostumersServices.css'

const URL_GET = 'http://localhost:10101/ClienteServicesGet'
const URL_COSTUMERS = 'https://redgas.onrender.com/ClienteServicesGetAll'
const URL_TECHGET = 'http://localhost:10101/TecnicoServicesGet'
const URL_TECHNICIAN = 'http://localhost:10101/TecnicoServicesGetAll'
const URL_SERVICESTECHNICIAN = 'http://localhost:10101/TecnicoServicesAdd'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: 24,
  p: 2,
}

const getServiceColor = (label) => {
  switch (label.toLowerCase()) {
    case 'reparación':
    case 'reparacion':
      return 'var(--Font-Nav2)'
    case 'mantenimiento':
      return 'var(--Font-Nav)'
    case 'instalación':
      return 'var(--main-color)'
    default:
      return 'var(--Font-Nav-shadow2)'
  }
};

export const CostumerServices = () => {
  const [isScrollable, setIsScrollable] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)
  const [technician, setTechnician] = useState([])
  const [costumer, setCosutmer] = useState([])
  const [result, setResult] = useState([])
  const accordionRef = useRef(null)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const alertTech = (status, title, message) => {
    const MySwal = withReactContent(Swal)

    switch (status) {
      case 'wait':
        Swal.fire({
          title: 'Cargando...',
          text: message || 'Estamos validando tu información.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          timer: 6000,
          timerProgressBar: true,
          didOpen: () => Swal.showLoading(),
        })
        break

      case 200:
        MySwal.fire({
          icon: 'success',
          title: title || 'Todo listo',
          text: message || 'Puedes continuar.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        })
        break

      case 401:
        MySwal.fire({
          html: `
            <div style="display: flex; align-items: center">
              <div style="font-size: 30px; color: #3498db; margin-right: 15px">ℹ️</div>
              <div style="text-align: left">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #2c3e50">
                  ${title || 'Servicio ya asignado'}
                </h3>
                <p style="margin: 0">${message || 'Ya tienes un servicio aceptado.'}</p>
              </div>
            </div>
          `,
          showConfirmButton: false,
          position: 'top-end',
          width: '350px',
          timer: 2500,
          timerProgressBar: true,
          background: '#ffffff',
        })
        break

      case 500:
        MySwal.fire({
          icon: 'error',
          title: title || 'Error',
          text: message || 'Ocurrió un error inesperado.',
          allowOutsideClick: false,
          showConfirmButton: true,
          confirmButtonText: 'Cerrar'
        })
        break

      default:
        Swal.fire({
          icon: 'info',
          title: title || 'Aviso',
          text: message || '',
        })
        break
    }
  }

  useEffect(() => {
    const fetchTech = async () => {
      if (token) {
        const decode = jwtDecode(token)
        const techId = decode.data.id

        try {
          const getTechRes = await fetch(`${URL_TECHGET}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ technicianId: techId }),
          })

          const data = await getTechRes.json()

          if (!data.get) {
            fetchData()
          } else {
            setTimeout(() => navigate('/Technica'), 0)
          }

        } catch (error) {
          alertTech(500, 'Error de conexión', 'No pudimos validar tu estado. Intenta más tarde.')
        }

      } else {
        alertTech(401, 'Token no válido', 'Inicia sesión nuevamente.')
      }
    }

    fetchTech()
  }, [])

  const fetchData = async () => {
    try {
      const responseCostumers = await fetch(URL_COSTUMERS, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const responseTechnician = await fetch(URL_TECHNICIAN, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!responseCostumers.ok || !responseTechnician.ok)
        throw new Error('Error fetching data')

      const costumers = await responseCostumers.json()
      const technicians = await responseTechnician.json()

      setCosutmer(costumers.get)
      setTechnician(technicians.get)

      const parsedResults = costumers.get.map((item) => {
        try {
          const parsedItem = JSON.parse(item.item)
          const secondParse = JSON.parse(parsedItem)
          return secondParse.resultado
        } catch (e) {
          console.error('Error al parsear item:', item)
          return null
        }
      })

      setResult(parsedResults)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    const checkHeight = () => {
      if (accordionRef.current) {
        setIsScrollable(accordionRef.current.offsetHeight > 240)
      }
    }

    checkHeight()
    window.addEventListener('resize', checkHeight)
    return () => window.removeEventListener('resize', checkHeight)
  }, [result])

  const getIconByLabel = (label) => {
    if (label === 'Reparación') return faTools
    if (label === 'Instalación') return faPlug
    if (label === 'Mantenimiento') return faGears
    return faQuestion
  }

  const handleOpen = (index) => setOpenIndex(index)
  const handleClose = () => setOpenIndex(null)

  const handleAceptServices = useCallback(async (id) => {
    if (isAccepting) return
    setIsAccepting(true)

    try {
      const res = await fetch(URL_SERVICESTECHNICIAN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: id }),
      })

      if (res.ok) {
      EmailServicesCostumer(id)
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsAccepting(false)
    }
  }, [isAccepting])

  const EmailServicesCostumer = async (id) => {

    try {
      const response = await fetch(`${URL_GET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id }),
      })

      if (!response.ok) {
        throw new Error('Error fetching data')
      }

      const datainfo = await response.json()
      const firstParse = JSON.parse(datainfo.get)
      const secondParse = JSON.parse(JSON.parse(firstParse.item))

      const userData = {
        user: firstParse.userName,
        phone: firstParse.userPhone,
        email: firstParse.userEmail,
        address: firstParse.userAddress,
        label: secondParse.resultado.etiqueta
      }

      handleForgotPassword(userData)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleForgotPassword = async ({ user, phone, email, address, label }) => {

    const serviceId = 'service_82gyxy6'
    const templateId = 'template_fwkby0l'
    const publicKey = 'SHHYhi-xHJeCovrBP'

    try {
      const templateParams = {
        to_email: email,
        company: 'RED-GAS',
        user: user || 'Usuario',
        message: `Hola ${user},

               Te informamos que tu solicitud de servicio ha sido aceptada por uno de nuestros técnicos.

               🛠️ Tipo de servicio: ${label}
               📍 Dirección registrada: ${address}
               📞 Teléfono de contacto: ${phone}

               Un técnico especializado se comunicará contigo muy pronto para iniciar el proceso. Te recomendamos estar atento(a) a tu teléfono o correo electrónico.

               Gracias por confiar en RedGas, trabajamos para brindarte un servicio rápido, seguro y profesional.

               —------------------------------------
               RedGas Soporte Técnico
               `,
        link: ` `,
      }

      emailjs.send(serviceId, templateId, templateParams, publicKey)
        .then(() => {
          alertTech(
            200,
            'Servicio Aceptado',
            'has aceptado el servicio'
          );
          setTimeout(() => navigate('/Technica'), 100)
        })
        .catch(() => {
          alertTech(
            402,
            'No se pudo Aceptar el servicio',
            'Ocurrió un error '
          )
        })

    } catch {
      alertTech(
        401,
        'Correo no encontrado',
        ''
      )
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center p-[0_5px] w-full">
        <div className="btnDown">
          <BtnBack To='/' />
        </div>
        <h2 className="font-bold text-4xl text-[var(--Font-Nav)]">
          MI SERVICIO
        </h2>
      </div>

      <section className="h-fit flex flex-wrap justify-center text-[var(--main-color)] items-center gap-[40px] !p-[80px_0] bg-[var(--background-color)] MainPageContainer">
        {costumer
          .filter((item, idx) => {
            const service = result[idx]
            if (!service) return false

            const alreadyAssigned = technician.some(tec => tec.userid === item.userId)
            return !alreadyAssigned
          })
          .map((item, idx) => {
            const service = result[idx]
            return (
              <div key={idx} className="userServiceTec flex flex-col items-start justify-center !rounded-[40px] max-w-[400px] min-w-0 NeoContainer_outset_TL p-5 gap-3">
                <div className="text-[var(--Font-Nav)] flex items-center gap-4 cursor-pointer" onClick={() => handleOpen(idx)}>
                  <FontAwesomeIcon icon={getIconByLabel(service.etiqueta)} className="text-4xl" />
                  <p className="text-3xl font-bold">{service.etiqueta}</p>
                </div>

                <div className="text-[var(--main-color-sub)] pl-2 gap-3 flex items-center font-bold w-fit cursor-pointer" onClick={() => handleOpen(idx)}>
                  <FontAwesomeIcon icon={faUser} className="text-[var(--main-color)] text-5xl" />
                  <div className="flex flex-col justify-center font-light leading-[20px] gap-[2px]">
                    {item.userName.length >= 12 && (
                      <p className="text-xl font-bold text-[var(--main-color)]">{item.userName.slice(0, 12) + '...'}</p>
                    )}
                    {item.userName.length < 12 && (
                      <p className="text-xl font-bold text-[var(--main-color)]">{item.userName}</p>
                    )}
                    <p className="text-[1rem]">{item.userPhone}</p>
                    <p className="text-[1rem]">{item.userAddress}</p>
                  </div>
                </div>

                <Modal
                  open={openIndex === idx}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={style} className="flex flex-col min-w-[330px] items-start justify-center gap-4 outline-none NeoContainer_outset_TL relative">
                    <IconButton
                      aria-label="close"
                      onClick={handleClose}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'var(--main-color-sub)',
                        zIndex: 10
                      }}
                    >
                      <CloseIcon />
                    </IconButton>

                    <div className="text-[var(--Font-Nav)] flex items-center gap-4">
                      <FontAwesomeIcon icon={getIconByLabel(service.etiqueta)} className="text-4xl" />
                      <p className="text-3xl font-bold">{service.etiqueta}</p>
                    </div>

                    <div className="text-[var(--main-color-sub)] pl-2 gap-3 flex items-center font-bold w-fit">
                      <FontAwesomeIcon icon={faUser} className="text-[var(--main-color)] text-5xl" />
                      <div className="flex flex-col justify-center font-light leading-[20px] gap-[8px]">
                        <p className="text-xl font-bold text-[var(--main-color)]">{item.userName}</p>
                        <p className="text-[1rem]">{item.userPhone}</p>
                        <p className="text-[1rem]">{item.userAddress}</p>
                        <p className="text-[1rem] flex gap-2"><span className="font-black">Problema:</span> {service.input}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                      <h4 className="text-3xl font-bold text-[var(--main-color)]">Pasos a seguir</h4>
                      <div
                        ref={accordionRef}
                        className={`accordionContain flex NeoContainer_outset_TL max-h-[256px] flex-col gap-0 ${isScrollable ? 'overflow-y-scroll' : 'overflow-y-auto'}`}
                      >
                        {service.posibles_soluciones?.map((itemParsed, i) => (
                          <Accordion key={i}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <p className="font-bold">{itemParsed.titulo}</p>
                            </AccordionSummary>
                            <AccordionDetails>
                              <p>{itemParsed.descripcion}</p>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </div>

                      <div className="w-full flex justify-center items-center">
                        <Buttons
                          type="submit"
                          nameButton={isAccepting ? "Procesando..." : "Aceptar Servicio"}
                          Onclick={() => handleAceptServices(item.userId)}
                          disabled={isAccepting}
                        />
                      </div>
                    </div>
                  </Box>
                </Modal>
              </div>
            )
          })}
      </section>
    </div>
  )
}

export default CostumerServices
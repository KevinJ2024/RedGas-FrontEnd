import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-scroll'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { tabsClasses } from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'

export const Navs = ({ className, ref1, ref2, ref3, ref4 }) => {
    const [tipoUsuario, setTipoUsuario] = useState(null)
    const [tabIndex, setTabIndex] = useState(0)
    const navigate = useNavigate()
    const sectionIds = ['Hero', 'OffersSect', 'AllProduct']

    const isMdUp = useMediaQuery('(min-width: 768px)')

    useEffect(() => {
        const tipo = localStorage.getItem('tipo_usuario')
        setTipoUsuario(tipo ? parseInt(tipo) : null)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = sectionIds.indexOf(entry.target.id)
                        if (index !== -1) setTabIndex(index)
                    }
                })
            },
            { rootMargin: '-100px 0px 0px 0px', threshold: 0.1 }
        )

        sectionIds.forEach(id => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue)
        switch (newValue) {
            case 0:
                document.getElementById('linkHero')?.click()
                break
            case 1:
                document.getElementById('linkOffers')?.click()
                break
            case 2:
                document.getElementById('linkMainPage')?.click()
                break
            case 3:
                navigate('/Technic')
                break
            case 4:
                navigate('/CostumerServices')
                break
            case 5:
                navigate('/Admin')
                break
            default:
                break
        }
    }

    return (
        <Box
            className={`w-full flex ${isMdUp ? 'flex-row' : 'flex-col'} ${className}`}
            sx={{
                flexGrow: 1,
                maxWidth: '100%',
                bgcolor: 'transparent',
            }}
        >
            <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                orientation={isMdUp ? 'horizontal' : 'vertical'}
                scrollButtons
                allowScrollButtonsMobile
                TabIndicatorProps={{
                    style: {
                        backgroundColor: '#19A9A4',
                        height: isMdUp ? '3px' : '100%',
                        width: isMdUp ? 'auto' : '3px',
                        left: isMdUp ? undefined : 0,   // Mover a la izquierda
                        right: isMdUp ? 0 : 'auto',     // Eliminar derecha
                    },
                }}
                sx={{
                    [`& .${tabsClasses.scrollButtons}`]: {
                        '&.Mui-disabled': { opacity: 0.3 },
                    },
                    '& .MuiTab-root': {
                        color: 'inherit',
                        borderBottom: isMdUp ? '3px solid transparent' : 'none',
                        borderLeft: !isMdUp ? '3px solid transparent' : 'none',
                        '&.Mui-selected': {
                            color: '#19A9A4',
                            borderBottom: isMdUp ? '3px solid #19A9A4' : 'none',
                            borderLeft: !isMdUp ? '3px solid #19A9A4' : 'none',
                        },
                    },
                }}
            >
                <Tab label="Inicio" />
                <Tab label="Ofertas" />
                <Tab label="Productos" />
                <Tab label="Técnicos" />
                {(tipoUsuario === 1 || tipoUsuario === 3) && <Tab label="Admin" />}
                {(tipoUsuario === 4) && <Tab label="Servi" />}
            </Tabs>

            {/* LINKS OCULTOS PARA DISPARAR SCROLL */}
            <div className="hidden">
                <span ref={ref1}>
                    <Link id="linkHero" to="Hero" smooth={true} duration={500} offset={-90} />
                </span>
                <span ref={ref2}>
                    <Link id="linkOffers" to="OffersSect" smooth={true} duration={500} offset={-130} />
                </span>
                <span ref={ref3}>
                    <Link id="linkMainPage" to="AllProduct" smooth={true} duration={500} offset={-130} />
                </span>
                <span ref={ref4} />
            </div>
        </Box>
    )
}

export default Navs

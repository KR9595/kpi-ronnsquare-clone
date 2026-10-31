import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import InertiaPlugin from 'gsap/InertiaPlugin'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, useGSAP)

export { Draggable, gsap, ScrollTrigger, useGSAP }

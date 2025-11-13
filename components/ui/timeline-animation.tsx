"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode, ElementType } from "react"

import { motion, HTMLMotionProps } from "motion/react"

interface TimelineContentProps extends HTMLMotionProps<"div"> {

  animationNum: number

  timelineRef: React.RefObject<HTMLElement | null>

  customVariants?: any

  as?: ElementType

  children?: ReactNode

}

export function TimelineContent({

  animationNum,

  timelineRef,

  customVariants,

  as = "div",

  children,

  ...props

}: TimelineContentProps) {

  const [isVisible, setIsVisible] = useState(false)

  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {

    const observer = new IntersectionObserver(

      ([entry]) => {

        if (entry.isIntersecting) {

          setIsVisible(true)

        }

      },

      { threshold: 0.1 }

    )

    if (elementRef.current) {

      observer.observe(elementRef.current)

    }

    return () => {

      if (elementRef.current) {

        observer.unobserve(elementRef.current)

      }

    }

  }, [])

  const MotionComponent = motion[as as keyof typeof motion] as any

  const defaultVariants = {

    visible: {

      y: 0,

      opacity: 1,

      filter: "blur(0px)",

      transition: {

        delay: animationNum * 0.1,

        duration: 0.5,

      },

    },

    hidden: {

      filter: "blur(10px)",

      y: -20,

      opacity: 0,

    },

  }

  const variants = customVariants || defaultVariants

  return (

    <MotionComponent

      ref={elementRef}

      initial="hidden"

      animate={isVisible ? "visible" : "hidden"}

      variants={variants}

      {...props}

    >

      {children}

    </MotionComponent>

  )

}


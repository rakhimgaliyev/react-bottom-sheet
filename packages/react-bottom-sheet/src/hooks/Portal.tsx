import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'


const createRootElement = (id: string) => {
  const rootContainer = document.createElement('div')
  rootContainer.setAttribute('id', id)
  rootContainer.style.cssText = 'position: fixed; z-index: 300;'
  return rootContainer
}


const addRootElement = (rootElem: HTMLElement) => {
  document.body.appendChild(rootElem)
}



const usePortal = (id: string): HTMLElement | null => {
  const rootElemRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }
    const existingParent = document.querySelector<HTMLElement>(`#${id}`)
    const parentElem = existingParent || createRootElement(id)
    const rootElem = rootElemRef.current

    if (!existingParent) {
      addRootElement(parentElem)
    }

    if (rootElem) {
      parentElem.appendChild(rootElem)
    }

    return () => {
      if (rootElem) {
        rootElem.remove()
      }
      if (!parentElem.childElementCount) {
        parentElem.remove()
      }
    }
  }, [id])

  
  const getRootElem = () => {
    if (typeof document === 'undefined') {
      return null
    }
    if (!rootElemRef.current) {
      rootElemRef.current = document.createElement('div')
      rootElemRef.current.style.cssText =
        'top: 0px; bottom: 0px; left: 0px; right: 0px; position: fixed; overflow: hidden;'
    }
    return rootElemRef.current
  }

  return getRootElem()
}

type PropsType = {
  id: string
  children: React.ReactNode
}


export const Portal: React.FC<PropsType> = ({ id, children }) => {
  const target = usePortal(id)
  if (target) {
    return ReactDOM.createPortal(children, target)
  }
  return null
}

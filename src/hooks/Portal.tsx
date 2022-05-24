import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

/**
 * Creates DOM element to be used as React root.
 * @returns {HTMLElement}
 */
const createRootElement = (id: string) => {
  const rootContainer = document.createElement('div')
  rootContainer.setAttribute('id', id)
  rootContainer.style.cssText = 'position: fixed; z-index: 300;'
  return rootContainer
}

/**
 * Appends element as last child of body.
 * @param {HTMLElement} rootElem
 */
const addRootElement = (rootElem: Element) => {
  document.body.insertBefore(
    rootElem,
    // @ts-ignore
    document.body.lastElementChild.nextElementSibling
  )
}

/**
 * Hook to create a React Portal.
 * Automatically handles creating and tearing-down the root elements (no SRR
 * makes this trivial), so there is no need to ensure the parent target already
 * exists.
 * @example
 * const target = usePortal(id, [id]);
 * return createPortal(children, target);
 * @param {String} id The id of the target container, e.g 'modal' or 'spotlight'
 * @returns {HTMLElement} The DOM node to use as the Portal target.
 */

const usePortal = (id: string): Element | null => {
  const rootElemRef = useRef(null)

  useEffect(() => {
    // Look for existing target dom element to append to
    const existingParent = document.querySelector(`#${id}`)
    // Parent is either a new root or the existing dom element
    const parentElem = existingParent || createRootElement(id)

    // If there is no existing DOM element, add a new one.
    if (!existingParent) {
      addRootElement(parentElem)
    }

    // Add the detached element to the parent
    // @ts-ignore
    parentElem.appendChild(rootElemRef.current)

    return () => {
      // @ts-ignore
      rootElemRef.current.remove()
      if (!parentElem.childElementCount) {
        parentElem.remove()
      }
    }
  }, [id])

  /**
   * It's important we evaluate this lazily:
   * - We need first render to contain the DOM element, so it shouldn't happen
   *   in useEffect. We would normally put this in the constructor().
   * - We can't do 'const rootElemRef = useRef(document.createElement('div))',
   *   since this will run every single render (that's a lot).
   * - We want the ref to consistently point to the same DOM element and only
   *   ever run once.
   * @link https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
   */
  const getRootElem = () => {
    if (!rootElemRef.current) {
      // @ts-ignore
      rootElemRef.current = document.createElement('div')
      // @ts-ignore
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

/**
 * @example
 * <Portal id="modal">
 *   <p>Thinking with portals</p>
 * </Portal>
 */
export const Portal: React.FC<PropsType> = ({ id, children }) => {
  const target = usePortal(id)
  if (target) {
    return ReactDOM.createPortal(children, target)
  }
  return <React.Fragment />
}

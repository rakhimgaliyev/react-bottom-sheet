import React, {useEffect, useState, useCallback, useRef, useMemo} from 'react'

import {createUseStyles} from 'react-jss'
import cx from 'classnames'
import {Portal} from './hooks/Portal'
import {useWindowSize} from './hooks/useWindowSize'
import {uniqueId} from './utils/utils'

const DIALOG_BORDER_RADIUS_PX = 30

const animationDuration = 0.25

const useStyles = createUseStyles(() => ({
  '@global': {
    'html[data-hide-scroll], html[data-hide-scroll] body': {
      position: 'relative !important'
    }
  },
  root: {
    top: 'auto',
    bottom: 0,
    left: 0,
    width: '100%',
    willChange: 'transform',

    position: 'fixed',

    zIndex: 2,
    '-webkit-transform': 'matrix(1, 0, 0, 1, 0, 0)',

    '@media (min-width: 641px)': {
      left: '50%',
      maxWidth: 500,
      transform: 'translate3d(-50%, 0, 0)',
      transition: `transform ${animationDuration}s cubic-bezier(0.7, 0.3, 0.1, 1)`
    }
  },
  rootIsOpen: {
    pointerEvents: 'auto'
  },
  mask: {
    position: 'fixed',
    top: -375,
    left: 0,
    bottom: 0,
    right: 0,
    opacity: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    transition: `opacity ${animationDuration}s cubic-bezier(0.7, 0.3, 0.1, 1)`,
    pointerEvents: 'auto',
    '-webkit-transform': 'translate3d(0, 0, 0)'
  },
  maskIsOpen: {
    opacity: 1
  },
  contentWrap: {
    width: '100%',
    bottom: 0,
    background: '#fff',
    overflow: 'hidden',
    '-webkit-transform': 'translate3d(0,0,0)',
    zIndex: 2,
    overscrollBehavior: 'none',
    scrollbarWidth: 'none',
    '-ms-overflow-style': 'none',
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    position: 'fixed',
    borderRadius: `${DIALOG_BORDER_RADIUS_PX}px ${DIALOG_BORDER_RADIUS_PX}px 0px 0px`,

    display: 'flex',
    justifyContent: 'center',
    transition: `transform ${animationDuration}s cubic-bezier(0.7, 0.3, 0.1, 1)`
  },
  inner: {
    width: '100%',
    overflowY: 'hidden',
    overflowX: 'hidden'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  scrollDiv: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  header: {
    position: 'relative',
    left: 0,
    top: 0,
    width: '100%'
  },
  footer: {
    position: 'relative',
    left: 0,
    bottom: 0,
    width: '100%'
  },
  shadowBox: {
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: 2,
    width: '100%'
  }
}))

const touchInitState = {
  startY: 0,
  touchStartY: 0,
  isTop: true,
  noScroll: false,
  startScrollTop: 0
}

const CLOSE_DIALOG_PERCENT = 0.25

enum BottomSheetStatus {
  DIALOG_INIT = 1,
  DIALOG_STARTED_TO_OPEN,
  DIALOG_IS_OPENING,
  DIALOG_IS_OPEN,
  DIALOG_STARTED_TO_CLOSE,
  DIALOG_IS_CLOSING,
  DIALOG_IS_CLOSED
}

type PropsType = {
  open: boolean
  onOpenChange?: (open: boolean) => void
  setOpen?: (open: boolean) => void
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  horizontalScrollElRef?: React.RefObject<HTMLElement | null>
}

export const BottomSheetDialog: React.FC<PropsType> = ({
                                                            open,
                                                            onOpenChange,
                                                            setOpen,
                                                            children,
                                                            header,
                                                            footer,
                                                            horizontalScrollElRef
                                                          }) => {
  const handleOpenChange = onOpenChange ?? setOpen

  const classes = useStyles()

  const maskRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const windowSize = useWindowSize()

  const [bottomSheetId] = useState(uniqueId())
  const [dialogViewState, setDialogViewState] = useState(BottomSheetStatus.DIALOG_INIT)
  const [isMovingContent, setIsMovingContent] = useState(false)
  const [isTouchMoveHandled, setIsTouchMoveHandled] = useState(false)
  const [touchState, setTouchState] = useState(touchInitState)
  const [touchY, setTouchY] = useState({
    curr: 0,
    prev: 0
  })
  const [scrollPercent, setScrollPercent] = useState(0)

  const clearStates = () => {
    setIsMovingContent(false)
    setIsTouchMoveHandled(false)
    setTouchState(touchInitState)
    setTouchY({
      curr: 0,
      prev: 0
    })
  }

  const [horizontalScrollElTouch, setHorizontalScrollElTouch] = useState({
    startX: 0,
    startY: 0,
    isCalculated: false,
    preventScroll: false
  })

  const isShown = useMemo(
    () =>
      dialogViewState === BottomSheetStatus.DIALOG_IS_OPENING || dialogViewState === BottomSheetStatus.DIALOG_IS_OPEN,
    [dialogViewState]
  )

  const bottomSheetOffsetY = useMemo(() => {
    if (
      dialogViewState === BottomSheetStatus.DIALOG_INIT ||
      dialogViewState === BottomSheetStatus.DIALOG_STARTED_TO_CLOSE ||
      dialogViewState === BottomSheetStatus.DIALOG_IS_CLOSING
    ) {
      return 0
    }
    const isStartedFromTop = touchState.startScrollTop === 0
    if (!isStartedFromTop) {
      return 0
    }
    const touchOffsetY = touchState.startY - touchY.curr
    if (touchOffsetY < 0 && (touchState.noScroll || touchState.isTop)) {
      return touchOffsetY
    }
    return 0
  }, [
    dialogViewState,
    touchState.startScrollTop,
    touchState.startY,
    touchState.noScroll,
    touchState.isTop,
    touchY.curr
  ])

  const handleStartClosing = () => {
    setDialogViewState(BottomSheetStatus.DIALOG_STARTED_TO_CLOSE)
  }

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      const eventTarget = event.target as Node | null
      if (horizontalScrollElRef && horizontalScrollElRef.current) {
        if (eventTarget && horizontalScrollElRef.current.contains(eventTarget)) {
          setHorizontalScrollElTouch({
            startX: event.touches[0].clientX,
            startY: event.touches[0].clientY,
            isCalculated: false,
            preventScroll: false
          })
          event.stopPropagation()
          return
        }
      }
      if (!contentRef.current) {
        if (event.cancelable) {
          event.preventDefault()
          return
        }
      }
      const contentEl = contentRef.current
      if (!contentEl) {
        return
      }
      event.stopPropagation()
      const maxScrollHeight = contentEl.scrollHeight - contentEl.clientHeight
      setIsTouchMoveHandled(false)
      setTouchState({
        ...touchState,
        startY: event.touches[0].clientY,
        touchStartY: event.touches[0].clientY,
        noScroll: maxScrollHeight === 0,
        isTop: contentEl.scrollTop === 0,
        startScrollTop: contentEl.scrollTop
      })
    },
    [horizontalScrollElRef, touchState]
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      const eventTarget = event.target as Node | null
      if (horizontalScrollElRef && horizontalScrollElRef.current) {
        if (eventTarget && horizontalScrollElRef.current.contains(eventTarget)) {
          if (!horizontalScrollElTouch.isCalculated) {
            const clientX = event.touches[0].clientX
            if (Math.abs(horizontalScrollElTouch.startX - clientX) < 5) {
              setHorizontalScrollElTouch({
                startX: 0,
                startY: 0,
                isCalculated: true,
                preventScroll: true
              })
              event.preventDefault()
            } else {
              const isLeft = horizontalScrollElRef.current.scrollLeft === 0
              const isRight =
                horizontalScrollElRef.current.scrollLeft ===
                horizontalScrollElRef.current.scrollWidth - horizontalScrollElRef.current.clientWidth

              if (
                (isLeft && horizontalScrollElTouch.startX - clientX < 0) ||
                (isRight && horizontalScrollElTouch.startX - clientX > 0)
              ) {
                setHorizontalScrollElTouch({
                  startX: 0,
                  startY: 0,
                  isCalculated: true,
                  preventScroll: true
                })
              } else {
                setHorizontalScrollElTouch({
                  startX: 0,
                  startY: 0,
                  isCalculated: true,
                  preventScroll: false
                })
              }
            }
          } else if (horizontalScrollElTouch.preventScroll) {
            event.preventDefault()
          } else {
            event.stopPropagation()
          }
          return
        }
      }
      if (!contentRef.current) {
        if (event.cancelable) {
          event.preventDefault()
          return
        }
      }
      const contentEl = contentRef.current
      if (!contentEl) {
        return
      }
      const clientY = event.touches[0].clientY
      const touchOffsetY = touchState.startY - clientY
      const isTop = contentEl.scrollTop === 0
      const isBottom =
        contentEl.scrollTop === contentEl.scrollHeight - contentEl.clientHeight

      let isMoving = isMovingContent

      if (!isTouchMoveHandled) {
        if (isTop && touchOffsetY < 0) {
          setIsMovingContent(true)
          isMoving = true
        }
        setIsTouchMoveHandled(true)
      }

      setTouchY({
        curr: clientY,
        prev: touchY.curr
      })

      if (touchState.noScroll || isMoving || (touchOffsetY < 0 && isTop) || (isBottom && touchOffsetY > 0)) {
        if (event.cancelable) {
          event.preventDefault()
        }
      }
    },
    [
      horizontalScrollElRef,
      horizontalScrollElTouch.isCalculated,
      horizontalScrollElTouch.preventScroll,
      horizontalScrollElTouch.startX,
      isMovingContent,
      isTouchMoveHandled,
      touchState.noScroll,
      touchState.startY,
      touchY.curr
    ]
  )

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      const eventTarget = event.target as Node | null
      if (horizontalScrollElRef && horizontalScrollElRef.current) {
        if (eventTarget && horizontalScrollElRef.current.contains(eventTarget)) {
          event.stopPropagation()
          return
        }
      }
      if (!contentRef.current) {
        if (event.cancelable) {
          event.preventDefault()
          return
        }
      }
      const contentEl = contentRef.current
      if (!contentEl) {
        return
      }
      setIsMovingContent(false)
      setTouchState({
        ...touchState,
        isTop: contentEl.scrollTop === 0
      })
      setTouchY({
        curr: 0,
        prev: 0
      })

      if (touchState.touchStartY !== 0) {
        const touchOffset = touchState.touchStartY - event.changedTouches[0].clientY
        if (touchState.isTop && touchOffset < 0) {
          const clientHeight = contentEl.clientHeight
          if (clientHeight > 0 && -touchOffset > clientHeight * CLOSE_DIALOG_PERCENT) {
            handleStartClosing()
          }
        }
      }
    },
    [horizontalScrollElRef, touchState]
  )

  const handleOnScroll = (event: Event) => {
    const target = event.target as HTMLDivElement | null
    if (!target) {
      return
    }
    const scrollableHeight = target.scrollHeight - target.clientHeight
    if (scrollableHeight <= 0) {
      setScrollPercent(1)
      return
    }
    setScrollPercent(target.scrollTop / scrollableHeight)
  }

  useEffect(() => {
    if (open && dialogViewState === BottomSheetStatus.DIALOG_INIT) {
      setDialogViewState(BottomSheetStatus.DIALOG_STARTED_TO_OPEN)
    }
    if (dialogViewState === BottomSheetStatus.DIALOG_STARTED_TO_OPEN) {
      setDialogViewState(BottomSheetStatus.DIALOG_IS_OPENING)
    }
    if (dialogViewState === BottomSheetStatus.DIALOG_STARTED_TO_CLOSE) {
      setDialogViewState(BottomSheetStatus.DIALOG_IS_CLOSING)
    }
    if (dialogViewState === BottomSheetStatus.DIALOG_IS_CLOSED) {
      clearStates()
      setDialogViewState(BottomSheetStatus.DIALOG_INIT)
      if (open && handleOpenChange) {
        handleOpenChange(false)
      }
    }
    if (!open && dialogViewState === BottomSheetStatus.DIALOG_IS_OPEN) {
      handleStartClosing()
    }
  }, [open, dialogViewState, handleOpenChange])

  const handleTransitionEnd = useCallback(() => {
    if (dialogViewState === BottomSheetStatus.DIALOG_IS_OPENING) {
      setDialogViewState(BottomSheetStatus.DIALOG_IS_OPEN)
    } else if (dialogViewState === BottomSheetStatus.DIALOG_IS_CLOSING) {
      setDialogViewState(BottomSheetStatus.DIALOG_IS_CLOSED)
    }
  }, [dialogViewState])

  useEffect(() => {
    const node = innerRef.current
    if (!node) {
      return
    }
    if (dialogViewState === BottomSheetStatus.DIALOG_IS_CLOSED) {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchmove', handleTouchMove)
      node.removeEventListener('touchend', handleTouchEnd)
      return
    }
    node.addEventListener('touchstart', handleTouchStart, {passive: false})
    node.addEventListener('touchmove', handleTouchMove, {passive: false})
    node.addEventListener('touchend', handleTouchEnd, {passive: false})
    return () => {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchmove', handleTouchMove)
      node.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dialogViewState, handleTouchStart, handleTouchMove, handleTouchEnd])

  useEffect(() => {
    const contentEl = contentRef.current
    if (dialogViewState === BottomSheetStatus.DIALOG_STARTED_TO_OPEN) {
      if (contentEl && children) {
        if (contentEl.scrollHeight !== contentEl.clientHeight) {
          setScrollPercent(0)
          contentEl.addEventListener('scroll', handleOnScroll, {passive: true})
        } else {
          setScrollPercent(1)
        }
      }
    } else if (dialogViewState === BottomSheetStatus.DIALOG_IS_CLOSED) {
      if (contentEl) {
        contentEl.removeEventListener('scroll', handleOnScroll)
      }
    }
  }, [children, dialogViewState])

  useEffect(() => {
    const contentEl = contentRef.current
    return () => {
      if (contentEl) {
        contentEl.removeEventListener('scroll', handleOnScroll)
      }
    }
  }, [])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (
        dialogViewState === BottomSheetStatus.DIALOG_IS_OPEN ||
        dialogViewState === BottomSheetStatus.DIALOG_IS_OPENING
      ) {
        if (e.cancelable) {
          e.preventDefault()
        }
        handleStartClosing()
      }
    }
    const node = maskRef.current
    if (node) {
      node.addEventListener('touchstart', handleTouchStart, {passive: false})
    }
    return () => {
      if (node) {
        node.removeEventListener('touchstart', handleTouchStart)
      }
    }
  }, [dialogViewState])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isShown) {
        handleStartClosing()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isShown])

  const bottomShadow = useMemo(() => {
    if (scrollPercent > 0.99) {
      return 'rgba(0, 0, 0, 0.05) 0px 8px 8px -4px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px inset'
    }
    if (scrollPercent > 0.01) {
      return 'rgba(0, 0, 0, 0.05) 0px 8px 8px -4px inset, rgba(0, 0, 0, 0.05) 0px -8px 8px -4px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px inset'
    }
    return 'rgba(0, 0, 0, 0) 0px 0px 0px 0px inset, rgba(0, 0, 0, 0.05) 0px -8px 8px -4px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px inset'
  }, [scrollPercent])

  if (dialogViewState === BottomSheetStatus.DIALOG_INIT) {
    return null
  }

  return (
    <Portal id={`BottomSheetComponent-${bottomSheetId}`}>
      <div className={cx(classes.mask, isShown && classes.maskIsOpen)} ref={maskRef}/>
      <div className={cx(classes.root, isShown && classes.rootIsOpen)} onTransitionEnd={handleTransitionEnd}>
        <div
          className={classes.contentWrap}
          role='dialog'
          aria-modal='true'
          style={{
            ...(!isShown && {
              transform: 'translate3d(0, 100%, 0)'
            }),
            ...(bottomSheetOffsetY !== 0 && {
              transition: 'none 0s ease 0s',
              transform: `translate3d(0, ${-bottomSheetOffsetY}px, 0)`
            })
          }}
        >
          <div className={classes.inner} ref={innerRef}>
            <div
              className={classes.content}
              style={{
                maxHeight: windowSize.height * 0.9
              }}
            >
              <div className={classes.header}>{header}</div>
              <div className={classes.scrollDiv} ref={contentRef}>
                <div
                  className={classes.shadowBox}
                  style={{
                    boxShadow: bottomShadow,
                    ...(contentRef.current && {
                      height: contentRef.current.offsetHeight
                    })
                  }}
                />
                {children}
              </div>
              <div className={classes.footer}>{footer}</div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}

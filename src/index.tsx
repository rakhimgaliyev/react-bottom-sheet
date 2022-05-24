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
      transform: 'translateX(-50%)',
      transition: 'translateX(-50%)'
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
    background: 'rgba(0, 0, 0, 0.7);',
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
  // eslint-disable-next-line no-unused-vars
  DIALOG_INIT = 1,
  // eslint-disable-next-line no-unused-vars
  DIALOG_STARTED_TO_OPEN,
  // eslint-disable-next-line no-unused-vars
  DIALOG_IS_OPENING,
  // eslint-disable-next-line no-unused-vars
  DIALOG_IS_OPEN,
  // eslint-disable-next-line no-unused-vars
  DIALOG_STARTED_TO_CLOSE,
  // eslint-disable-next-line no-unused-vars
  DIALOG_IS_CLOSING,
  // eslint-disable-next-line no-unused-vars
  DIALOG_IS_CLOSED
}

type PropsType = {
  open: boolean
  setOpen: (open: boolean) => void
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  horizontalScrollElRef?: any
}

export const BottomSheetDialog: React.FC<PropsType> = ({
                                                            open,
                                                            setOpen,
                                                            children,
                                                            header,
                                                            footer,
                                                            horizontalScrollElRef
                                                          }) => {
  const classes = useStyles()

  const maskRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef(null)

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
    (event: any) => {
      if (horizontalScrollElRef && horizontalScrollElRef.current) {
        if (horizontalScrollElRef.current.contains(event.target)) {
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
      event.stopPropagation()
      // @ts-ignore
      const maxScrollHeight = contentRef.current.scrollHeight - contentRef.current.clientHeight
      setIsTouchMoveHandled(false)
      setTouchState({
        ...touchState,
        startY: event.touches[0].clientY,
        touchStartY: event.touches[0].clientY,
        noScroll: maxScrollHeight === 0,
        // @ts-ignore
        isTop: contentRef.current.scrollTop === 0,
        // @ts-ignore
        startScrollTop: contentRef.current.scrollTop
      })
    },
    [horizontalScrollElRef, touchState]
  )

  const handleTouchMove = useCallback(
    (event: any) => {
      if (horizontalScrollElRef && horizontalScrollElRef.current) {
        if (horizontalScrollElRef.current.contains(event.target)) {
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
      const clientY = event.touches[0].clientY
      const touchOffsetY = touchState.startY - clientY
      // @ts-ignore
      const isTop = contentRef.current.scrollTop === 0
      const isBottom =
        // @ts-ignore
        contentRef.current.scrollTop === contentRef.current.scrollHeight - contentRef.current.clientHeight

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
    (event: any) => {
      if (horizontalScrollElRef && horizontalScrollElRef.current) {
        if (horizontalScrollElRef.current.contains(event.target)) {
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
      setIsMovingContent(false)
      setTouchState({
        ...touchState,
        // @ts-ignore
        isTop: contentRef.current.scrollTop === 0
      })
      setTouchY({
        curr: 0,
        prev: 0
      })

      if (touchState.touchStartY !== 0) {
        const touchOffset = touchState.touchStartY - event.changedTouches[0].clientY
        if (touchState.isTop && touchOffset < 0) {
          // @ts-ignore
          const clientHeight = contentRef.current.clientHeight
          if (clientHeight > 0 && -touchOffset > clientHeight * CLOSE_DIALOG_PERCENT) {
            handleStartClosing()
          }
        }
      }
    },
    [horizontalScrollElRef, touchState]
  )

  const handleOnScroll = (event: any) => {
    const target = event.target
    setScrollPercent(target.scrollTop / (target.scrollHeight - target.clientHeight))
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
      if (open) {
        setOpen(false)
      }
    }
    if (!open && dialogViewState === BottomSheetStatus.DIALOG_IS_OPEN) {
      handleStartClosing()
    }
  }, [open, dialogViewState, setOpen])

  const handleTransitionEnd = useCallback(() => {
    if (dialogViewState === BottomSheetStatus.DIALOG_IS_OPENING) {
      setDialogViewState(BottomSheetStatus.DIALOG_IS_OPEN)
    } else if (dialogViewState === BottomSheetStatus.DIALOG_IS_CLOSING) {
      setDialogViewState(BottomSheetStatus.DIALOG_IS_CLOSED)
    }
  }, [dialogViewState])

  useEffect(() => {
    if (dialogViewState === BottomSheetStatus.DIALOG_IS_CLOSED) {
      if (innerRef && innerRef.current) {
        // @ts-ignore
        innerRef.current.removeEventListener('touchstart', handleTouchStart)
        // @ts-ignore
        innerRef.current.removeEventListener('touchmove', handleTouchMove)
        // @ts-ignore
        innerRef.current.removeEventListener('touchend', handleTouchEnd)
      }
    }

    if (innerRef && innerRef.current) {
      // @ts-ignore
      innerRef.current.addEventListener('touchstart', handleTouchStart, {passive: false})
      // @ts-ignore
      innerRef.current.addEventListener('touchmove', handleTouchMove, {passive: false})
      // @ts-ignore
      innerRef.current.addEventListener('touchend', handleTouchEnd, {passive: false})
    }

    return () => {
      if (innerRef && innerRef.current) {
        // @ts-ignore
        innerRef.current.removeEventListener('touchstart', handleTouchStart)
        // @ts-ignore
        innerRef.current.removeEventListener('touchmove', handleTouchMove)
        // @ts-ignore
        innerRef.current.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [dialogViewState, handleTouchStart, handleTouchMove, handleTouchEnd])

  useEffect(() => {
    if (dialogViewState === BottomSheetStatus.DIALOG_STARTED_TO_OPEN) {
      if (contentRef && contentRef.current && children) {
        if (contentRef.current.scrollHeight !== contentRef.current.clientHeight) {
          setScrollPercent(0);
          contentRef.current.addEventListener('scroll', handleOnScroll, {passive: true});
        } else {
          setScrollPercent(1);
        }
      }
    } else if (dialogViewState === BottomSheetStatus.DIALOG_IS_CLOSED) {
      if (contentRef && contentRef.current) {
        contentRef.current.removeEventListener('scroll', handleOnScroll)
      }
    }
  }, [children, dialogViewState]);

  useEffect(() => {
    return () => {
      if (contentRef && contentRef.current) {
        contentRef.current.removeEventListener('scroll', handleOnScroll);
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
    if (maskRef && maskRef.current) {
      maskRef.current.addEventListener('touchstart', handleTouchStart, {passive: false})
    }
    return () => {
      if (maskRef && maskRef.current) {
        maskRef.current.removeEventListener('touchstart', handleTouchStart)
      }
    }
  }, [dialogViewState])

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
    return <React.Fragment/>
  }

  return (
    <Portal id={`BottomSheetComponent-${bottomSheetId}`}>
      <div className={cx(classes.mask, isShown && classes.maskIsOpen)} ref={maskRef}/>
      <div className={cx(classes.root, isShown && classes.rootIsOpen)} onTransitionEnd={handleTransitionEnd}>
        <div
          className={classes.contentWrap}
          style={{
            ...(!isShown && {
              transform: 'translateY(100%)'
            }),
            ...(bottomSheetOffsetY !== 0 && {
              transition: 'none 0s ease 0s',
              transform: `translateY(${-bottomSheetOffsetY}px`
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

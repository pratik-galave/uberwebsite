import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { SocketDataContext } from './socketDataContext'

const SocketContext = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

    const socketInstance = io(socketUrl, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected:', socketInstance.id)
    })

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('Socket disconnected:', reason)
    })

    socketInstance.on('connect_error', (error) => {
      setIsConnected(false)
      console.error('Socket connection error:', error.message)
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [])

  const sendMessageToEvent = useCallback((eventName, payload) => {
    if (!socket || !isConnected || !eventName) {
      console.warn('sendMessageToEvent skipped:', {
        hasSocket: Boolean(socket),
        isConnected,
        eventName,
      })
      return
    }

    console.log('sendMessageToEvent emitted:', { eventName, payload })
    socket.emit(eventName, payload)
  }, [socket, isConnected])

  const receiveMessageFromEvent = useCallback((eventName, handler) => {
    if (!socket || !eventName || typeof handler !== 'function') {
      return () => {}
    }

    socket.on(eventName, handler)

    return () => {
      socket.off(eventName, handler)
    }
  }, [socket])

  const value = useMemo(() => ({
    socket,
    isConnected,
    sendMessageToEvent,
    receiveMessageFromEvent,
  }), [socket, isConnected, sendMessageToEvent, receiveMessageFromEvent])

  return (
    <SocketDataContext.Provider value={value}>
      {children}
    </SocketDataContext.Provider>
  )
}

export default SocketContext

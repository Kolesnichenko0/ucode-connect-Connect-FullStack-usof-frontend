import React from 'react'
import {Navigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from '../store'

interface PrivateRouteProps {
    children: React.ReactElement
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({children}) => {
    const user = useSelector((state: RootState) => state.auth.user)

    if (!user) {
        return <Navigate to="/login" replace/>
    }

    return children
}

export default PrivateRoute

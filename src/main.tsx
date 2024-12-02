import ReactDOM from 'react-dom/client'
import {Provider} from 'react-redux'
import App from './App'
import store from './store'
import userService from './services/userService'
import './index.css'

const accessToken = sessionStorage.getItem('accessToken')
if (accessToken) {
    userService.setAuthToken(accessToken)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <Provider store={store}>
        <App/>
    </Provider>
)

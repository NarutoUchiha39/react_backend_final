import PropTypes from 'prop-types';
import '../css/errors.css'

function BootstrapErrors(props)
{
    return(
        <>
            {
                props.notifications.notification && <div className={`${props.notifications.notification}`} id='message'><img src="https://i.imgur.com/GnyDvKN.png" alt="" style={{marginRight:"1%"}}/> {props.notifications.message}</div>
            }
            
        </>
    )
}

BootstrapErrors.propTypes={
    notifications : PropTypes.object,
    control:PropTypes.func
}
export default BootstrapErrors
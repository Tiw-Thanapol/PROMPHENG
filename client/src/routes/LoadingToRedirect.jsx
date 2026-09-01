import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"


const LoadingToRedirect = ({
    to = "/",
    delay = 0
}) => {

    const [count, setCount] =
        useState(
            delay > 0 ? Math.ceil(delay / 1000) : 0
        )

    const [redirect, setRedirect] =
        useState(
            delay === 0
        )


    useEffect(() => {

        if (delay <= 0) {

            return

        }


        const interval =
            setInterval(() => {

                setCount((currentCount) => {

                    if (currentCount <= 1) {

                        clearInterval(interval)

                        setRedirect(true)

                        return 0

                    }


                    return currentCount - 1

                })

            }, 1000)


        return () => {

            clearInterval(interval)

        }

    }, [delay])


    // ==================================================
    // REDIRECT
    // ==================================================

    if (redirect) {

        return (
            <Navigate
                to={to}
                replace
            />
        )

    }


    // ==================================================
    // NO DELAY
    // ==================================================

    if (delay <= 0) {

        return null

    }


    // ==================================================
    // COUNTDOWN
    // ==================================================

    return (

        <div>

            No permission, Redirect in {count}

        </div>

    )

}


export default LoadingToRedirect
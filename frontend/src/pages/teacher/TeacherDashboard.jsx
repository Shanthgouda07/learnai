import React, { useState } from 'react'
import ClassObservatory from '../../components/ClassObservatory'
import StarfieldSky from '../../components/StarfieldSky'

export default function TeacherDashboard() {
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2600)
  }

  return (
    <div className="relative animate-fade-in max-w-[1050px] mx-auto space-y-6">
      <StarfieldSky />
      <ClassObservatory onToast={showToast} />
      <p className="mu text-xs text-center mt-6">
        Synthetic demo data · Teachers approve every AI draft · Names are never sent to the AI.
      </p>

      {toastVisible && (
        <div id="toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthGuard } from '../../hooks/useAuthGuard'
import { dashboardService } from '../../services'

export function Dashboard() {
  useAuthGuard() // Protect this route
  const { t } = useTranslation('common')

  const [loading, setLoading] = React.useState(false)
  const [data, setData] = useState<any>({
    totalMembers: 0,
    totalUnpaidInvoices: 0,
    totalPartialInvoices: 0,
    totalCancelInvoices: 0,
  })

  useEffect(() => {
    let ignore = false
    const run = async () => {
      try {
        setLoading(true)
        const data = await dashboardService.get()
        console.log({ data })
        if (!ignore) setData(data)
      } catch (e: any) {
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    run()
    return () => {
      ignore = true
    }
  }, [])

  const drawBarChart = (canvas: any, data: any) => {
    const ctx = canvas.getContext('2d')
    const barWidth = 50
    const spaceBetweenBars = 30
    const height = 200

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const values = [
      data.totalMembers,
      data.totalUnpaidInvoices,
      data.totalPartialInvoices,
      data.totalCancelInvoices,
    ]
    const labels = ['Total Members', 'Unpaid Invoices', 'Partial Invoices', 'Cancelled Invoices']

    values.forEach((value, index) => {
      const x = index * (barWidth + spaceBetweenBars)
      const y = height - value
      ctx.fillStyle = 'rgba(0, 123, 255, 0.7)'
      ctx.fillRect(x, y, barWidth, value)
    })

    labels.forEach((label, index) => {
      const x = index * (barWidth + spaceBetweenBars) + barWidth / 2
      ctx.fillStyle = 'black'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(label, x, height + 15)
    })
  }

  useEffect(() => {
    const canvas = document.getElementById('barChart')
    drawBarChart(canvas, data)
  }, [data])

  return (
    <div>
      {loading && <h2>{t('dashboard')}</h2>}
      {/* <p>This is a protected page.</p> */}

      {!loading && data && (
        <div>
          <div className="card-dashboard">
            <h3>Total Members & Invoices In This Month</h3>
            <canvas id="barChart" width="400" height="200"></canvas>
          </div>

          <div className="dashboard-stats">
            <div className="card-dashboard">
              <h4>{t('Total Members')}</h4>
              <p>{data.totalMembers}</p>
            </div>
            <div className="card-dashboard">
              <h4>{t('Total Unpaid Invoices')}</h4>
              <p>{data.totalUnpaidInvoices}</p>
            </div>
            <div className="card-dashboard">
              <h4>{t('Total Partial Invoices')}</h4>
              <p>{data.totalPartialInvoices}</p>
            </div>
            <div className="card-dashboard">
              <h4>{t('Total Cancel Invoices')}</h4>
              <p>{data.totalCancelInvoices}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

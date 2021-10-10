import express from 'express'

import routes from './routes'

const app = express()

app.use(routes)

app.listen(process.env.PORT || 3333, () => {
  console.log('[INFO] Server is running on port "%d"', process.env.PORT || 3333)
})

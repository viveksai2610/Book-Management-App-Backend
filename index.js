const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())

const dbPath = path.join(__dirname, 'books.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

app.get('/books/', async (request, response) => {
  const getBooksQuery = `SELECT
      *
    FROM
      books
    ORDER BY
       bookID;`
  const booksArray = await db.all(getBooksQuery)
  response.status(200)
  response.send(booksArray)
})

app.get('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE bookID = ${bookId};`
  const bookArray = await db.get(getBookQuery)
  response.status(200)
  response.send(bookArray)
})


app.post('/books/', async (request, response) => {
  const bookDetails = request.body
  const {bookId, title, author, genre, pages, publishedDate} = bookDetails

  const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE
      bookID = ${bookId};`
  const book = await db.get(getBookQuery)

  if (book === undefined) {
    const addBookQuery = `INSERT INTO books (bookID, title, author, genre, pages, publishedDate)
    VALUES
      (
         ${bookId},
        '${title}',
        '${author}',
        '${genre}',
         ${pages},
        '${publishedDate}'
      );`

    await db.run(addBookQuery)
    response.status(200)
    response.send('Book Added Successfully')
  } else {
    response.status(400)
    response.send('Enter valid book ID')
  }
})

app.put('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const bookDetails = request.body
  const {title, author, genre, pages, publishedDate} = bookDetails

  const getBookQuery = `SELECT
      *
    FROM
      books
    WHERE
      bookID = ${bookId};`
  const book = await db.get(getBookQuery)

  if (book !== undefined) {
    const updateBookQuery = `UPDATE
      books
    SET
      title='${title}',
      author = '${author}',
      genre = '${genre}',
      pages = ${pages},
      publishedDate = '${publishedDate}' 
    WHERE
      bookID = ${bookId};`
    await db.run(updateBookQuery)
    response.status(200)
    response.send('Book Updated Successfully')
  } else {
    response.status(400)
    response.send('Enter valid book ID')
  }
})

app.delete('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const deleteBookQuery = `DELETE FROM 
      books 
    WHERE
      bookID = ${bookId};`
  await db.run(deleteBookQuery)
  response.status(200)
  response.send('Book Deleted Successfully')
})


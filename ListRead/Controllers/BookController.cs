using ListRead.Models;
using ListRead.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace ListRead.Controllers
{
    public class BookController : ApiController
    {
        private static BookRepository repository = new BookRepository();
        public IEnumerable<Book> Get()
        {
            return repository.GetAll().OrderBy(x => x.Priority);
        }

        public Book Get(int Id)
        {
            var item = repository.Get(Id);

            if (item == null)
            {
                var message = string.Format("Book with id = {0} not found", Id);
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.NotFound, message));
            }
            return item;
        }


        public Book Post(Book item)
        {
            if (ModelState.IsValid)
            {
                item.Priority = GetPriority(item);
                return repository.Add(item);
            }
            else
            {
                Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
            return null;
        }

        protected int GetPriority(Book item)
        {
            int lastPriority = repository.GetNextPriority();
            if (!item.Priority.HasValue || item.Priority == 0 || item.Priority > lastPriority)
            {
                if (item.Id != 0)
                {
                    return lastPriority - 1;
                }                
            }            
            return item.Priority.Value;
        }

        // PUT api/listtoread/5
        public void Put(Book item)
        {
            if (ModelState.IsValid)
            {
                item.Priority = GetPriority(item);
                repository.Update(item);
            }
        }

        // DELETE api/listtoread/5
        public void Delete(int id)
        {
            var book = repository.Get(id);
            var books = repository.Find(x => x.Priority > book.Priority);

            foreach (var bookItem in books)
            {
                bookItem.Priority--;
                repository.Update(book);
            }
            repository.Delete(id);
        }
    }
}

addEventListener('fetch', event => {
  event.respondWith(fetchAndApply(event.request))
})

async function fetchAndApply(request) {
  let url = new URL(request.url)
  if (request.method != 'GET' && request.method != 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 })
  }
  const target = new URL("https://huggingface.co" +  url.pathname)
  const req = new Request(target, {
    method: request.method,
    headers: request.headers,
  })
  return fetch(req, {
    method: request.method == 'GET' ? 'GET' : 'HEAD',
    redirect: 'follow',
    headers,
  })
}

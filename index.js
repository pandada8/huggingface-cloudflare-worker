addEventListener('fetch', event => {
  event.respondWith(fetchAndApply(event.request))
})

let map = [
  { regexp: /^\/proxmox\/(.*)$/, url: 'http://download.proxmox.com/$1' },
  // github release
  //  https://github.com/k3s-io/k3s/releases/download/v1.26.1%2Bk3s1/k3s
  {
    regexp: /^\/github.com\/(.*)\/(.*)\/releases\/download\/(.*)\/(.*)$/,
    url: 'https://github.com/$1/$2/releases/download/$3/$4',
  },
  {
    regexp: /^\/github.com\/(.*)\/(.*)\/archive\/refs\/(.*)$/,
    url: 'https://github.com/$1/$2/archive/refs/$3',
  },
  { regexp: /^\/generic\/(.*$)/, url: 'https://$1' },
]

let commonHeaders = ['if-modified-since']

async function fetchAndApply(request) {
  let url = new URL(request.url)
  if (request.method != 'GET' && request.method != 'HEAD') {
    return new Response('Method Not Allowed', { status: 405 })
  }
  for (const match of map) {
    if (url.pathname.match(match.regexp)) {
      const target = new URL(url.pathname.replace(match.regexp, match.url))
      const headers = new Headers({
        'Accept-Encoding': 'gzip',
        Accept: '*/*',
      })
      for (const h of commonHeaders) {
        if (request.headers.has(h)) {
          headers.set(h, request.headers.get(h))
        }
      }
      return fetch(target, {
        method: request.method == 'GET' ? 'GET' : 'HEAD',
        redirect: 'follow',
        headers,
      })
    }
  }
  return new Response(
    'Welcome to Generic Download Proxy powered by Cloudflare Workers',
    { status: 200 },
  )
}

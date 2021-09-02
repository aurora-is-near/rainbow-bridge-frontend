export function get (...paramNames) {
  const params = new URLSearchParams(window.location.search)

  if (paramNames.length === 0) {
    return Object.fromEntries(params.entries())
  }

  if (paramNames.length === 1) {
    return params.get(paramNames[0])
  }

  return paramNames.reduce(
    (obj, paramName) => ({ ...obj, [paramName]: params.get(paramName) }),
    {}
  )
}

export function set (newParams) {
  const params = new URLSearchParams(window.location.search)
  for (const param in newParams) {
    params.set(param, newParams[param])
  }
  window.history.replaceState({}, '', `${location.pathname}?${params}`)
}

export function setPush (newParams) {
  const params = new URLSearchParams(window.location.search)
  for (const param in newParams) {
    params.set(param, newParams[param])
  }
  if (!newParams.new) params.delete('new')
  window.history.pushState({}, '', `${location.pathname}?${params}`)
}

export function clear (...paramNames) {
  if (paramNames.length === 0) {
    window.history.replaceState({}, '', location.pathname)
  } else {
    const params = new URLSearchParams(window.location.search)
    paramNames.forEach(p => params.delete(p))
    if (params.toString()) {
      window.history.replaceState({}, '', `${location.pathname}?${params}`)
    } else {
      window.history.replaceState({}, '', location.pathname)
    }
  }
}

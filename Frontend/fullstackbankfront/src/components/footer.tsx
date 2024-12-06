export default function Footer() {
  return (
      <footer className="bg-black text-white py-10">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold mb-4">Rest</h3>
                      <p className="text-sm text-gray-400">
                          Somos un grupo de estudiantes apasionados, creando soluciones para mejorar tu experiencia
                          bancaria. Gracias por ver nuestro proyecto.
                      </p>
                  </div>

                  <div className="text-center">
                      <h3 className="text-xl font-bold mb-4">Enlaces</h3>
                      <ul className="space-y-2">
                          <li>
                              <button className="text-gray-300 hover:text-white transition-colors">
                                  Política de Privacidad
                              </button>
                          </li>
                          <li>
                              <button className="text-gray-300 hover:text-white transition-colors">
                                  Términos y Condiciones
                              </button>
                          </li>
                          <li>
                              <button className="text-gray-300 hover:text-white transition-colors">
                                  Ayuda
                              </button>
                          </li>
                      </ul>
                  </div>

                  <div className="text-center sm:text-right">
                      <h3 className="text-xl font-bold mb-4">Síguenos</h3>
                      <div className="flex justify-center sm:justify-end space-x-4">
                          <button
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                              aria-label="Facebook"
                          >
                              <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                  <path
                                      d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24H12.82V14.706h-3.255v-3.6h3.255V8.412c0-3.262 1.994-5.037 4.905-5.037 1.393 0 2.59.103 2.937.15v3.41h-2.016c-1.576 0-1.88.749-1.88 1.846v2.418h3.755l-.489 3.6h-3.266V24h6.412c.731 0 1.324-.593 1.324-1.324V1.324C24 .593 23.407 0 22.676 0z"/>
                              </svg>
                          </button>
                          <button
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                              aria-label="Twitter"
                          >
                              <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                  <path
                                      d="M23.954 4.569c-.885.394-1.83.658-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.95.564-2.005.974-3.127 1.195-.896-.954-2.173-1.55-3.591-1.55-2.717 0-4.917 2.2-4.917 4.917 0 .385.045.76.127 1.122-4.083-.205-7.7-2.159-10.125-5.134-.422.722-.664 1.561-.664 2.475 0 1.708.87 3.215 2.188 4.099-.807-.026-1.566-.247-2.228-.617v.062c0 2.385 1.693 4.374 3.946 4.828-.413.111-.849.171-1.296.171-.316 0-.623-.03-.924-.086.631 1.953 2.445 3.377 4.6 3.416-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.788-.023-1.175-.068 2.179 1.396 4.768 2.211 7.548 2.211 9.051 0 14.001-7.496 14.001-13.986 0-.21-.004-.423-.014-.633.961-.695 1.8-1.562 2.462-2.549z"/>
                              </svg>
                          </button>
                          <button
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                              aria-label="Instagram"
                          >
                              <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                              >
                                  <path
                                      d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.32 3.608 1.294.974.975 1.231 2.241 1.293 3.608.058 1.265.069 1.645.069 4.849s-.012 3.584-.069 4.849c-.062 1.366-.32 2.633-1.294 3.608-.975.974-2.241 1.231-3.608 1.293-1.265.058-1.645.069-4.849.069s-3.584-.012-4.849-.069c-1.366-.062-2.633-.32-3.608-1.293-.974-.975-1.231-2.241-1.293-3.608-.058-1.265-.069-1.645-.069-4.849s.012-3.584.069-4.849c.062-1.366.32-2.633 1.294-3.608.975-.974 2.241-1.231 3.608-1.293 1.265-.058 1.645-.069 4.849-.069zm0-2.163c-3.257 0-3.667.011-4.947.07-1.297.061-2.737.343-3.822 1.427-1.085 1.085-1.366 2.525-1.427 3.822-.059 1.28-.07 1.69-.07 4.947s.011 3.667.07 4.947c.061 1.297.343 2.737 1.427 3.822 1.085 1.085 2.525 1.366 3.822 1.427 1.28.059 1.69.07 4.947.07s3.667-.011 4.947-.07c1.297-.061 2.737-.343 3.822-1.427 1.085-1.085 1.366-2.525 1.427-3.822.059-1.28.07-1.69.07-4.947s-.011-3.667-.07-4.947c-.061-1.297-.343-2.737-1.427-3.822-1.085-1.085-2.525-1.366-3.822-1.427-1.28-.059-1.69-.07-4.947-.07z"/>
                                  <circle cx="12" cy="12" r="3.514"/>
                                  <path d="M17.646 5.354a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"/>
                              </svg>
                          </button>
                      </div>
                  </div>
              </div>

              <div className="text-center mt-10 text-gray-500">
                  <p>&copy; 2024 Rest. Todos los derechos reservados.</p>
              </div>
          </div>
      </footer>

  );
}




 document.addEventListener('DOMContentLoaded', function() {
    const { createClient } = supabase;
    const _supabase = createClient('https://yhfyasuswpdzupdzllvo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZnlhc3Vzd3BkenVwZHpsbHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk5ODM4NTcsImV4cCI6MjAwNTU1OTg1N30.ORQTRiX-X72q81RcsXww1nk75POlGgHQwKX6Meb4wzk');
    
    let currentPage = 1; // Número de página actual
    const perPage = 1000; // Cantidad de resultados por página
    let totalCorreos = 0;
    let indiceActual = 0;
    let indiceActualb = 0;
    
    const conteoPorDia = {};
    let totalCorreosNoEnBDVentasDiarias = 0; 
    const conteoEnCAP_EMAIL_CHECKOUT = {};
    let acorreosNoEnBDVentasDiarias=[];
    const correosEnVentasPorFecha = [];
    const correosnoVentasPorFecha = [];
    async function consultarSupabase(tabla, campos) {
        try {
            const { data, error } = await _supabase
                .from(tabla)
                .select(campos)
                .range(currentPage * perPage - perPage, currentPage * perPage - 1)
                .order("created_at", { ascending: false });
    
            if (error) {
                console.error(`Error al consultar ${tabla}:`, error);
                return { total: 0, data: [], error };
            }
    
            const total = data ? data.length : 0;
            return { total, data, error: null };
        } catch (error) {
            return { total: 0, data: [], error };
        }
    }
    
    async function obtenerCorreos() {
        const { total: totalCheckout, data: correosCheckout, error: errorCheckout } = await consultarSupabase('CAP_EMAIL_CHECKOUT', '*');
    
        const { total: totalVentas, data: correosVentas, error: errorVentas } = await consultarSupabase('BD_Ventas_diarias_relacionada', 'email_kj, oferta, created_at');
    
        if (errorCheckout || errorVentas) {
            console.error("Error al cargar datos:", errorCheckout || errorVentas);
            return;
        }

        
        const correosUnicos = new Set();
        const correosRepetidos = [];
        const correosPorFecha = {};
        correosCheckout.forEach((item) => {
            const email = item.email;
            const fecha = new Date(item.created_at);
            const fechaKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
        
            if (correosUnicos.has(email)) {
                correosRepetidos.push({ email, oferta: item.titulooferta, fecha: item.created_at }); // Agrega tanto el correo como la fecha
            } else {
                correosUnicos.add(email);
            }
        
            if (!correosPorFecha[fechaKey]) {
                correosPorFecha[fechaKey] = [];
            }
        
            correosPorFecha[fechaKey].push({ email, oferta: item.titulooferta, fecha: item.created_at }); // Agrega tanto el correo como la fecha
        });


        const correosVentasPorFecha = {};

        correosVentas.forEach((venta) => {
            const fecha = new Date(venta.created_at);
            const fechaKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
        
            if (!correosVentasPorFecha[fechaKey]) {
                correosVentasPorFecha[fechaKey] = [];
            }
        
            correosVentasPorFecha[fechaKey].push({
                email: venta.email_kj, // Agrega el correo
                oferta: venta.oferta, // Agrega la oferta
                fecha: venta.created_at, // Agrega la fecha
            });
        });
        
        // Comparar correos por fecha con correos de ventas por fecha
        
        
        for (const fecha in correosPorFecha) {
            const correosPorFechaActual = correosPorFecha[fecha];
            const fechaKey = `${fecha}`;
        
            if (correosVentasPorFecha[fechaKey]) {
                const correosEnVentas = correosVentasPorFecha[fechaKey];
                const correosNoEnVentas = correosPorFechaActual.filter((correo) => !correosEnVentas.includes(correo));
        
                correosEnVentasPorFecha.push({
                    fecha: fechaKey,
                    correosEnVentas: correosEnVentas,
                    correosNoEnVentas: correosNoEnVentas,
                });
            } else {
                // No hay correos de ventas para esta fecha
                correosEnVentasPorFecha.push({
                    fecha: fechaKey,
                    correosEnVentas: [],
                    correosNoEnVentas: correosPorFechaActual,
                });
            }
        }

      // 

        let contenido = ''; // Variable para almacenar el contenido
        
        correosEnVentasPorFecha.forEach((fechaCorreos) => {
            const fecha = fechaCorreos.fecha;
            const totalCorreos = fechaCorreos.correosNoEnVentas.length;
        
            // Construye la cadena de información
            contenido += `Fecha: ${fecha}, Total: ${totalCorreos}\n`;


        });
        let contenidob = ''; // Variable para almacenar el contenido
        
        correosEnVentasPorFecha.forEach((fechaCorreos) => {
            const fecha = fechaCorreos.fecha;
            const totalCorreos = fechaCorreos.correosEnVentas.length;
        
            // Construye la cadena de información
            contenidob += `Fecha: ${fecha}, Total: ${totalCorreos}\n`;


        });
        
        // Asigna el contenido al div
        //sinCompraPorDiaDiv.textContent = contenido;
        const totalreg = document.getElementById('total');
        totalreg.innerHTML = totalCheckout;
        const carg = document.getElementById('cargando');
        carg.style.display = 'none';
        const tablaBody = document.getElementById('tabla-correos-body');
        const bottotal = document.getElementById('totalreg');
// Iterar a través de la data de correosCheckout y crear filas de la tabla
correosCheckout.forEach((registro) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${registro.email}</td>
        <td>${registro.titulooferta}</td>
        <td>${registro.created_at}</td>
        `;
    tablaBody.appendChild(fila);
});



bottotal.addEventListener('click', function() {
    tablaBody.innerHTML = '';
correosCheckout.forEach((registro) => {
   
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${registro.email}</td>
        <td>${registro.titulooferta}</td>
        <td>${registro.created_at}</td>
        `;
    tablaBody.appendChild(fila);
});
});
        console.log(totalCheckout);
       

        
       // console.log("Correos repetidos:", correosRepetidos);

        const repetidos = document.getElementById('repetidos');
        repetidos.innerHTML =  correosRepetidos.length;
        const botRep = document.getElementById('botrep');
        botRep.addEventListener('click', function() {
            // Limpia la tabla existente (si es necesario)
            tablaBody.innerHTML = '';
    
            correosRepetidos.forEach((correo) => {
                const filaHTML = `
                    <tr>
                        <td>${correo.email}</td>
                        <td>${correo.oferta}</td>
                        <td>${correo.fecha}</td>
                    </tr>
                `;
                tablaBody.innerHTML += filaHTML;
            });
        });
        





      //  console.log("Total de correos repetidos:", correosPorFecha);
        //console.log(correosUnicos);
       // console.log("Correos por fecha:", correosPorFecha);
       
        const correosUnicosVentas = new Set(correosVentas.map((venta) => venta.email_kj));

        // Filtrar correos que están en correosUnicos pero no en correosUnicosVentas
        const correosNoEnVentas = Array.from(correosUnicos).filter((correo) => !correosUnicosVentas.has(correo));
        const correossiEnVentas = Array.from(correosUnicos).filter((correo) => correosUnicosVentas.has(correo));
       
        const totalsincompra = document.getElementById('totalsincompra');
        totalsincompra.innerHTML = correosNoEnVentas.length;
        //console.log("Correos no en totalVentas:", correosNoEnVentas);


    
        const sincompra = document.getElementById('sincompra');
        sincompra.addEventListener('click', function() {
            // Limpia la tabla existente (si es necesario)
            tablaBody.innerHTML = '';
        
            correosNoEnVentas.forEach((correo) => {
                const filaHTML = `
                <tr>
                <td>${correo}</td>
                
            </tr>
                `;
                tablaBody.innerHTML += filaHTML;
            });
        });




        
        const concompra = document.getElementById('concompra');
        concompra.addEventListener('click', function() {
            // Limpia la tabla existente (si es necesario)
            tablaBody.innerHTML = '';
        
            correossiEnVentas.forEach((correo) => {
                const filaHTML = `
                <tr>
                <td>${correo}</td>
                
            </tr>
                `;
                tablaBody.innerHTML += filaHTML;
            });
        });
        
     



       // console.log("Correos en ventas por fecha:", correosEnVentasPorFecha);

        const totalconcompra = document.getElementById('totalconcompra');
        totalconcompra.innerHTML = correossiEnVentas.length;
        console.log("Correos no en totalVentas:", correossiEnVentas);



        const colores = ['lightblue', 'lightcoral', 'lightgreen', 'lightpink']; // Paleta de colores
        let colorIndex = 0;

        const conCompraDiaDiv = document.getElementById('concompradia');
        conCompraDiaDiv.addEventListener('click', function() {
            if (event.target.id === 'concompradia') {
               // carg.style.display = 'block';
                tablaBody.innerHTML = ''; // Limpia la tabla antes de agregar datos
                setTimeout(function() {
                    correosEnVentasPorFecha.forEach((fechaCorreos) => {
                        const fecha = fechaCorreos.fecha;
                        const correos = fechaCorreos.correosEnVentas; // Cambia a correosEnVentas
            
                        if (correos.length > 0) {
                            const color = colores[colorIndex % colores.length];
                            
                            // Agrega un encabezado con el fondo de color para el grupo de correos con la misma fecha
                            const filaEncabezado = `
                                <tr>
                                    <td colspan="3" style="background-color: ${color}; text-align: center;">
                                        <strong>Correos con venta el día: ${fecha}</strong>
                                    </td>
                                </tr>
                            `;
                            tablaBody.innerHTML += filaEncabezado;
                            
                            // Agrega cada correo con la misma fecha y fondo de color
                            correos.forEach((correo) => {
                                const filaHTML = `
                                    <tr style="background-color: ${color};">
                                        <td>${correo.email}</td>
                                        <td>${correo.oferta}</td>
                                        <td>${fecha}</td>
                                    </tr>
                                `;
                                tablaBody.innerHTML += filaHTML;
                            });
                            
                            colorIndex++;
                        }
                    });
                    
                  //  carg.style.display = 'none'; // Oculta el indicador de carga cuando se completa la tabla
                }, 50); // Puedes ajustar el retardo (en milisegundos) según sea necesario
            }
        });
        




        const sinCompraDiaDiv = document.getElementById('sincompradia');
        sinCompraDiaDiv.addEventListener('click', function() {
            if (event.target.id === 'sincompradia') {
              //  carg.style.display = 'block';
                tablaBody.innerHTML = ''; // Limpia la tabla antes de agregar datos
                setTimeout(function() {
                  
        
                    correosEnVentasPorFecha.forEach((fechaCorreos) => {
                        const fecha = fechaCorreos.fecha;
                        const correos = fechaCorreos.correosNoEnVentas;
                        
                        if (correos.length > 0) {
                            const color = colores[colorIndex % colores.length];
                            
                            // Agrega un encabezado con el fondo de color para el grupo de correos con la misma fecha
                            const filaEncabezado = `
                                <tr>
                               
                                <td colspan="3" style="background-color: ${color}; text-align: center;">
                                <strong>Correos sin venta el día: ${fecha}</strong>
                            </td>
                                    </tr>
                            `;
                            tablaBody.innerHTML += filaEncabezado;
                            
                            // Agrega cada correo con la misma fecha y fondo de color
                            correos.forEach((correo) => {
                                const filaHTML = `
                                    <tr style="background-color: ${color};">
                                        <td>${correo.email}</td>
                                        <td>${correo.oferta}</td>
                                        <td>${fecha}</td>
                                    </tr>
                                `;
                                tablaBody.innerHTML += filaHTML;
                            });
                            
                            colorIndex++;
                        }
                    });
                    
                  //  carg.style.display = 'none'; // Oculta el indicador de carga cuando se completa la tabla
                }, 50); // Puedes ajustar el retardo (en milisegundos) según sea necesario
            }
        });



        mostrarContenido(indiceActual);
        mostrarContenidocom(indiceActualb)
    }
    const sinCompraPorDiaDiv = document.getElementById('sincomprapordia');

    function mostrarContenido(indice) {
        if (indice >= 0 && indice < correosEnVentasPorFecha.length) {
            const fechaCorreos = correosEnVentasPorFecha[indice];
            const fecha = fechaCorreos.fecha;
            const totalCorreos = fechaCorreos.correosNoEnVentas.length;
            sinCompraPorDiaDiv.textContent = `${fecha}, Total: ${totalCorreos}`;
        }
    }

    

    
    const botonAvanzar = document.getElementById('botonAvanzar');
    botonAvanzar.addEventListener('click', () => {
        if (indiceActual < correosEnVentasPorFecha.length - 1) {
            indiceActual++;
            mostrarContenido(indiceActual);
        }
    });
    
    const botonRetroceder = document.getElementById('botonRetroceder');
    botonRetroceder.addEventListener('click', () => {
        if (indiceActual > 0) {
            indiceActual--;
            mostrarContenido(indiceActual);
        }
    });


    const conCompraPorDiaDiv = document.getElementById('concomprapordia');

    function mostrarContenidocom(indice) {
        if (indice >= 0 && indice < correosEnVentasPorFecha.length) {
            const fechaCorreos = correosEnVentasPorFecha[indice];
            const fecha = fechaCorreos.fecha;
            const totalCorreos = fechaCorreos.correosEnVentas.length;
            conCompraPorDiaDiv.textContent = `${fecha}, Total: ${totalCorreos}`;
        }
    }


    
    const botonAvanzarcon = document.getElementById('botonAvanzarcon');
    botonAvanzarcon.addEventListener('click', () => {
        if (indiceActual < correosEnVentasPorFecha.length - 1) {
            indiceActual++;
            mostrarContenidocom(indiceActual);
        }
    });
    
    const botonRetrocedercon = document.getElementById('botonRetrocedercon');
    botonRetrocedercon.addEventListener('click', () => {
        if (indiceActual > 0) {
            indiceActual--;
            mostrarContenidocom(indiceActual);
        }
    });


    obtenerCorreos();
});
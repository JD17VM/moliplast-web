export const fetchData = async (url, setData, setLoading, setError) => {
    setLoading(true);
    setError('');

    try {
        const response = await fetch(url);

        if (response.status === 404) {
            console.log('No hay datos disponibles');
            setData([]);
            setLoading(false);
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos. Por favor, intenta nuevamente.');
        setData([]);
    } finally {
        setLoading(false);
    }
};

export const deleteResource = async (
    url,          // URL del endpoint (ej: `${BASE_URL_API}/api/catalogos/${id}`)
    id,           // ID del recurso a eliminar
    setLoading,   // Función para manejar el estado de carga
    setError,     // Función para manejar errores
    setSuccess,   // Función para manejar mensajes de éxito
    loadData      // Función para recargar los datos después de eliminar (ej: loadCatalogos)
) => {
    if (window.confirm("¿Estás seguro de eliminar este recurso?")) {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`${url}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            // Intentar obtener la respuesta incluso si hay un error
            let responseData;
            try {
                responseData = await response.json();
            } catch (e) {
                console.error('Error al parsear la respuesta JSON:', e);
            }
            
            if (!response.ok) {
                if (responseData && responseData.message) {
                    throw new Error(responseData.message);
                }
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            setSuccess('Recurso eliminado exitosamente!');
            loadData(); // Recargar los datos después de eliminar
        } catch (error) {
            console.error('Error eliminando recurso:', error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }
};
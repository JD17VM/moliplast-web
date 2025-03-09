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
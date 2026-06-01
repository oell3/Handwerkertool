
async function geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search`;
    const res = await axios.get(url, {
        params: {
            q: address,
            format: 'json',
            limit: 1
        },
        headers: {
            'User-Agent': 'MeineApp/1.0'
        }
    });

    if (res.data.length === 0) throw new Error('Adresse nicht gefunden');

    return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon)
    };
}
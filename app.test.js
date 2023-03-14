
const app = require('./app')

test('get Ayah audio url from refrence <Surah:Ayah>', async () => {
    expect(await app.getAyahURL('1:1'))
        .toBe("https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3");
});

test('get Ayaht audio urls as list from multible refrences', async () => {
    expect(await app.getAyahtURLs(['1:1', '1:2']))
        .toEqual(
            [
                'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
                'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3'
            ]
        );
});

test('download audio files from remote server and merge them in one file', async () => {
    expect(await app.downloadMerge(
        ['1:1', '1:2'],`${__dirname}/files`
    ))
        .toBe("success");
});
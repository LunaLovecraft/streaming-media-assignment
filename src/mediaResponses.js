const fs = require('fs');
const path = require('path');

const bird = path.resolve(__dirname, '../client/bird.mp4');
const bling = path.resolve(__dirname, '../client/bling.mp3');
const party = path.resolve(__dirname, '../client/party.mp4');

const getMedia = (request, response, fileName, contentType) => {
  fs.stat(fileName, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    const range = request.headers.range;

    if (!range) {
      return response.writeHead(416);
    }

    const positions = range.replace(/bytes=/, '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });

    const stream = fs.createReadStream(fileName, { start, end });

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  getMedia(request, response, party, 'video/mp4');
};

const getBird = (request, response) => {
  getMedia(request, response, bird, 'video/mp4');
};

const getBling = (request, response) => {
  getMedia(request, response, bling, 'audio/mpeg');
};

module.exports.getParty = getParty;
module.exports.getBird = getBird;
module.exports.getBling = getBling;

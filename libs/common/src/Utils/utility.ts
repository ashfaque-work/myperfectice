import { dbConfig } from "../config";

export function regexEscape(str: string): string {
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

export function regex(text: string, ...opts: string[]): RegExp {
  const reg = regexEscape(text);
  return new RegExp(reg, opts.join(''));
}

export function getReqInstanceByModel(model: any) {
  var req = {
    headers: {
      instancekey: ''
    }
  }

  var url = model.db.host + ':' + model.db.port + '/' + model.db.name
  var dbIndex = objectIndexOf(dbConfig, 'url', url)
  if (dbIndex >= 0) {
    req.headers.instancekey = dbConfig[dbIndex].instancekey
  }
  return req
}

export function objectIndexOf(array: any, propName: string, propValue: string) {
  var index = -1
  if (array.length > 0) {
    array.forEach(function (obj, objIndex) {
      if (String(obj[propName]) == String(propValue)) {
        index = objIndex
      }
    })
  }
  return index
}
export function round(value, dec, max?) {
  let val = dec ? Math.round((value + Number.EPSILON) * 10 * dec) / (10 * dec) : Math.round(value + Number.EPSILON);
  if (max && val > max) {
    val = max
  }
  return val
}


export function regexName(name: string): any {
  return {
    $regex: new RegExp([escapeRegExp(name).replace(/\s+/g, ' ').trim()].join(''), 'i')
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

export function shuffleArray(array: any) {
  let m = array.length,
    t, i

  // While there remain elements to shuffle
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--)

    // And swap it with the current element.
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }

  return array
}

export function fetchVideos(videoList, providerId, topicId) {
  var finalData = []
  for (var i = 0; i < videoList.length; i++) {
    searchDataFromVideoList(videoList[i].Children, providerId, topicId, finalData)
  }
  return finalData
}
function searchDataFromVideoList(videoChildArray, providerId, topicId, finalData) {
  for (var j = 0; j < videoChildArray.length; j++) {
    if (videoChildArray[j]._id.toString() === providerId.toString()) {
      if (videoChildArray[j].Children && videoChildArray[j].Children.length > 0) {
        recurSearchForVidoes(videoChildArray[j].Children, topicId, finalData)
      } else {
        recurSearchForVidoes(videoChildArray, topicId, finalData)
      }
    } else if (videoChildArray[j].Children) {
      if (videoChildArray[j].Children.length > 0) {
        searchDataFromVideoList(videoChildArray[j].Children, providerId, topicId, finalData)
      }
    }
  }
}

function recurSearchForVidoes(cdatas, topicId, finalData) {
  for (var j = 0; j < cdatas.length; j++) {
    var cdata = cdatas[j]
    if (cdata && cdata.Children && cdata.Children.length > 0) {
      for (var y = 0; y < cdata.Children.length; y++) {
        if (cdata.Children[y].kind == 'Video') {
          finalData.push({
            'url': cdata.Children[y].ka_url,
            'title': cdata.Children[y].title,
            'vtype': cdata.Children[y].youtube_id,
            'description': cdata.Children[y].description,
            'topic_id': topicId,
            'vname': 'Khan Academy'
          })
        }
        if (cdata.Children[y] && cdata.Children[y].Children) {
          recurSearchForVidoes(cdata.Children[y].Children, topicId, finalData)
        }
      }
    } else if (cdata && cdata.kind) {
      if (cdata.kind == 'Video') {
        finalData.push({
          'url': cdata.ka_url,
          'title': cdata.title,
          'vtype': cdata.youtube_id,
          'description': cdata.description,
          'topic_id': topicId,
          'vname': 'Khan Academy'
        })
        if (cdata.Children && cdata.Children.length > 0) {
          recurSearchForVidoes(cdata.Children, topicId, finalData)
        }
      }
    }
  }
}

export function matchArray(arr1: any[], arr2: any[]): any[] {
  const result: any[] = [];

  arr1.forEach(a1 => {
    arr2.forEach(a2 => {
      if (a1.toString() === a2.toString()) {
        result.push(a1);
      }
    });
  });

  return result;
}

export function replacer(name: any, val: any) {
  if (typeof val === 'object')
    for (var key in val) {
      if (key != "levels") {
        if (Array.isArray(val[key]) && val[key].length > 0) {
          val[key].forEach(function (doc, index) {
            val[key][index] = '@s@' + val[key][index].toString() + '@e@'
          })
        } else if (typeof val[key] === 'object' && val[key].toString().length === 24) {
          val[key] = '@s@' + val[key].toString() + '@e@'
        }
      }
    }
  return val
}
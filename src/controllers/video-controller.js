import path from 'path'
import fs from 'fs/promises'
import fsSync from 'fs'

import { VIDEO_FILES_PATH } from '../config/files'

import '../lib/types'

export default class VideoController {
  /**
   * Gets the cat video from the file system
   * @param { import('express').Request } request
   * @param { import('express').Response } response
   */
  static async getVideo(request, response) {
    const videoPath = path.join(VIDEO_FILES_PATH, 'cat.mp4')

    const videoInfo = await VideoController.#getVideoInfo(
      videoPath,
      request.headers.range
    )

    const videoStreamOptions = VideoController.#getVideoStreamOptions(videoInfo)

    const videoStream = VideoController.#getVideoStream(
      videoPath,
      videoStreamOptions
    )

    const headers = VideoController.#getDefaultVideoHeaders(videoInfo)

    response.writeHead(206, headers)
    videoStream.pipe(response)
  }

  /**
   * Factory for a VideoStreamOptions object
   * @param { VideoInfoType } videoInfo Video information
   * @returns { VideoStreamOptionsType } A VideoStreamOptions object
   */
  static #getVideoStreamOptions({ videoStart, videoEnd }) {
    return {
      start: videoStart,
      end: videoEnd,
    }
  }

  /**
   * Factory method for a video ReadStream
   * @param { string } videoPath Video file path
   * @param { VideoStreamOptionsType } videoStreamOptions Options object for the video stream
   * @returns { fsSync.ReadStream } The video stream for the given video file path
   */
  static #getVideoStream(videoPath, videoStreamOptions) {
    return fsSync.createReadStream(videoPath, videoStreamOptions)
  }

  /**
   * Factory method for the VideoInfo
   * @param { string } videoPath Video file path
   * @param { number } range Response range in bytes
   * @returns { VideoInfoType } A VideoInfo object
   */
  static async #getVideoInfo(videoPath, range) {
    const videoStats = await fs.stat(videoPath)
    const videoSize = videoStats.size
    const videoChunkSize = 1 * 1e6

    const videoStart = Number(range.replace(/\D/g, ''))
    const videoEnd = Math.min(videoStart + videoChunkSize, videoSize - 1)

    return {
      videoSize,
      videoChunkSize,
      videoStart,
      videoEnd,
    }
  }

  /**
   * Factory method for the default video headers
   * @param { VideoInfoType } videoInfo Video info object
   * @returns Response headers for the video stream
   */
  static #getDefaultVideoHeaders(videoInfo) {
    const { videoStart, videoEnd, videoSize } = videoInfo

    const contentLength = videoEnd - videoStart + 1

    const headers = {
      'Content-Range': `bytes ${videoStart}-${videoEnd}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    }

    return headers
  }
}

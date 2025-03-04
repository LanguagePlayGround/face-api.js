import * as tf from '@tensorflow/tfjs-core';

import { isMediaElement } from './commons/isMediaElement';
import { isTensor3D, isTensor4D } from './commons/isTensor';
import { NetInput } from './NetInput';
import { TNetInput } from './types';
import { awaitMediaLoaded, resolveInput } from './utils';

/**
 * Validates the input to make sure, they are valid net inputs and awaits all media elements
 * to be finished loading.
 *
 * @param input The input, which can be a media element or an array of different media elements.
 * @param manageCreatedInput If a new NetInput instance is created from the inputs, this flag
 * determines, whether to set the NetInput as managed or not.
 * @returns A NetInput instance, which can be passed into one of the neural networks.
 */
export async function toNetInput(
  inputs: TNetInput,
  manageCreatedInput: boolean = false
): Promise<NetInput> {
  if (inputs instanceof NetInput) {
    return inputs
  }

  const afterCreate = (netInput: NetInput) => manageCreatedInput
    ? netInput.managed()
    : netInput

  if (isTensor4D(inputs)) {
    return afterCreate(new NetInput(inputs as tf.Tensor4D))
  }

  let inputArgArray = Array.isArray(inputs)
      ? inputs
      : [inputs]

  if (!inputArgArray.length) {
    throw new Error('toNetInput - empty array passed as input')
  }

  const getIdxHint = (idx: number) => Array.isArray(inputs) ? ` at input index ${idx}:` : ''

  const inputArray = inputArgArray
    .map(resolveInput)
    .map((input, i) => {
      if (isTensor4D(input)) {
        // if tf.Tensor4D is passed in the input array, the batch size has to be 1
        const batchSize = input.shape[0]
        if (batchSize !== 1) {
          throw new Error(`toNetInput -${getIdxHint(i)} tf.Tensor4D with batchSize ${batchSize} passed, but not supported in input array`)
        }
        // to tf.Tensor3D
        return input.reshape(input.shape.slice(1))
      }
      return input
    })

  inputArray.forEach((input, i) => {
    if (!isMediaElement(input) && !isTensor3D(input)) {

      if (typeof inputArgArray[i] === 'string') {
        throw new Error(`toNetInput -${getIdxHint(i)} string passed, but could not resolve HTMLElement for element id ${inputArgArray[i]}`)
      }

      throw new Error(`toNetInput -${getIdxHint(i)} expected media to be of type HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | tf.Tensor3D, or to be an element id`)
    }
  })

  // wait for all media elements being loaded
  await Promise.all(
    inputArray.map(input => isMediaElement(input) && awaitMediaLoaded(input))
  )

  return afterCreate(new NetInput(inputArray, Array.isArray(inputs)))
}
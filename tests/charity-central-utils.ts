import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CampaignCreated,
  CharityVerified,
  OwnershipTransferred
} from "../generated/CharityCentral/CharityCentral"

export function createCampaignCreatedEvent(
  campaignAddress: Address,
  charityAddress: Address,
  name: string,
  goal: BigInt
): CampaignCreated {
  let campaignCreatedEvent = changetype<CampaignCreated>(newMockEvent())

  campaignCreatedEvent.parameters = new Array()

  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignAddress",
      ethereum.Value.fromAddress(campaignAddress)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "charityAddress",
      ethereum.Value.fromAddress(charityAddress)
    )
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("goal", ethereum.Value.fromUnsignedBigInt(goal))
  )

  return campaignCreatedEvent
}

export function createCharityVerifiedEvent(
  charityAddress: Address,
  name: string
): CharityVerified {
  let charityVerifiedEvent = changetype<CharityVerified>(newMockEvent())

  charityVerifiedEvent.parameters = new Array()

  charityVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "charityAddress",
      ethereum.Value.fromAddress(charityAddress)
    )
  )
  charityVerifiedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return charityVerifiedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

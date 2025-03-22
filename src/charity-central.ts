import {
  CampaignCreated as CampaignCreatedEvent,
  CharityVerified as CharityVerifiedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/CharityCentral/CharityCentral"
import {
  CampaignCreated,
  CharityVerified,
  OwnershipTransferred
} from "../generated/schema"

export function handleCampaignCreated(event: CampaignCreatedEvent): void {
  let entity = new CampaignCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.campaignAddress = event.params.campaignAddress
  entity.charityAddress = event.params.charityAddress
  entity.name = event.params.name
  entity.goal = event.params.goal

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCharityVerified(event: CharityVerifiedEvent): void {
  let entity = new CharityVerified(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.charityAddress = event.params.charityAddress
  entity.name = event.params.name

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

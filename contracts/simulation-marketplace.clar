;; Species NFT Contract

(define-non-fungible-token species-nft uint)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_SPECIES (err u101))

;; Data variables
(define-data-var last-species-id uint u0)

;; Data maps
(define-map species-data
  uint
  {
    creator: principal,
    ecosystem-id: uint,
    name: (string-ascii 64),
    traits: (list 10 (tuple (trait (string-ascii 32)) (value (string-utf8 64)))),
    rarity: uint
  }
)

;; Public functions
(define-public (mint-species (ecosystem-id uint) (name (string-ascii 64)) (traits (list 10 (tuple (trait (string-ascii 32)) (value (string-utf8 64))))) (rarity uint))
  (let
    (
      (species-id (+ (var-get last-species-id) u1))
    )
    (try! (nft-mint? species-nft species-id tx-sender))
    (map-set species-data
      species-id
      {
        creator: tx-sender,
        ecosystem-id: ecosystem-id,
        name: name,
        traits: traits,
        rarity: rarity
      }
    )
    (var-set last-species-id species-id)
    (ok species-id)
  )
)

(define-public (transfer-species (species-id uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (unwrap! (nft-get-owner? species-nft species-id) ERR_INVALID_SPECIES)) ERR_NOT_AUTHORIZED)
    (try! (nft-transfer? species-nft species-id tx-sender recipient))
    (ok true)
  )
)

(define-public (evolve-species (species-id uint) (new-traits (list 10 (tuple (trait (string-ascii 32)) (value (string-utf8 64))))))
  (let
    (
      (species (unwrap! (map-get? species-data species-id) ERR_INVALID_SPECIES))
    )
    (asserts! (is-eq tx-sender (get creator species)) ERR_NOT_AUTHORIZED)
    (ok (map-set species-data
      species-id
      (merge species { traits: new-traits })
    ))
  )
)

;; Read-only functions
(define-read-only (get-species-data (species-id uint))
  (map-get? species-data species-id)
)

(define-read-only (get-species-owner (species-id uint))
  (nft-get-owner? species-nft species-id)
)

(define-read-only (get-last-species-id)
  (var-get last-species-id)
)


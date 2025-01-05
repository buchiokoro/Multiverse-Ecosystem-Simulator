;; Simulation Marketplace Contract

(define-fungible-token simulation-token)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INSUFFICIENT_BALANCE (err u101))
(define-constant ERR_INVALID_LISTING (err u102))

;; Data variables
(define-data-var listing-nonce uint u0)

;; Data maps
(define-map listings
  uint
  {
    seller: principal,
    token-type: (string-ascii 20),
    token-id: uint,
    price: uint,
    status: (string-ascii 20)
  }
)

;; Public functions
(define-public (create-listing (token-type (string-ascii 20)) (token-id uint) (price uint))
  (let
    (
      (listing-id (+ (var-get listing-nonce) u1))
    )
    (map-set listings
      listing-id
      {
        seller: tx-sender,
        token-type: token-type,
        token-id: token-id,
        price: price,
        status: "active"
      }
    )
    (var-set listing-nonce listing-id)
    (ok listing-id)
  )
)

(define-public (cancel-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings listing-id) ERR_INVALID_LISTING))
    )
    (asserts! (is-eq tx-sender (get seller listing)) ERR_NOT_AUTHORIZED)
    (ok (map-set listings
      listing-id
      (merge listing { status: "cancelled" })
    ))
  )
)

(define-public (buy-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings listing-id) ERR_INVALID_LISTING))
      (price (get price listing))
    )
    (asserts! (is-eq (get status listing) "active") ERR_INVALID_LISTING)
    (try! (ft-transfer? simulation-token price tx-sender (get seller listing)))
    (ok (map-set listings
      listing-id
      (merge listing { status: "sold" })
    ))
  )
)

(define-public (mint-tokens (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (ft-mint? simulation-token amount recipient)
  )
)

;; Read-only functions
(define-read-only (get-listing (listing-id uint))
  (map-get? listings listing-id)
)

(define-read-only (get-balance (account principal))
  (ft-get-balance simulation-token account)
)


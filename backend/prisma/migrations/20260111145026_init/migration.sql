-- CreateTable
CREATE TABLE "Navigation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Navigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "navigationId" TEXT NOT NULL,
    "parentId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "productCount" INTEGER,
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "price" DECIMAL(65,30),
    "currency" TEXT,
    "imageUrl" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDetail" (
    "productId" TEXT NOT NULL,
    "description" TEXT,
    "specs" JSONB,
    "ratingsAvg" DECIMAL(65,30),
    "reviewsCount" INTEGER,
    "publisher" TEXT,
    "publicationDate" TIMESTAMP(3),
    "isbn" TEXT,
    "lastScrapedAt" TIMESTAMP(3),

    CONSTRAINT "ProductDetail_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "author" TEXT,
    "rating" INTEGER,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeJob" (
    "id" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "errorLog" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "pathJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViewHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_slug_key" ON "Navigation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Navigation_sourceUrl_key" ON "Navigation"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Category_sourceUrl_key" ON "Category"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Category_navigationId_slug_key" ON "Category"("navigationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sourceId_key" ON "Product"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sourceUrl_key" ON "Product"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Review_productId_author_text_key" ON "Review"("productId", "author", "text");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeJob_targetUrl_targetType_key" ON "ScrapeJob"("targetUrl", "targetType");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_navigationId_fkey" FOREIGN KEY ("navigationId") REFERENCES "Navigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDetail" ADD CONSTRAINT "ProductDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

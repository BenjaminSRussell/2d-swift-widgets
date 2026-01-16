# Aggregation Engine Design

## Executive Summary

The Aggregation Engine is the core component responsible for transforming raw document data into structured, visualizable information. This document provides comprehensive analysis of aggregation engine architecture, processing patterns, and optimization strategies for high-performance data visualization.

## Architecture Overview

### System Context

The Aggregation Engine operates as a background processing service that:

1. **Monitors** document stores for changes
2. **Extracts** relevant metrics using NLP techniques
3. **Normalizes** data into coordinate space
4. **Optimizes** for widget consumption

```swift
class AggregationEngine {
    private let documentMonitor: DocumentMonitor
    private let extractionPipeline: ExtractionPipeline
    private let normalizationEngine: NormalizationEngine
    private let optimizationEngine: OptimizationEngine
    
    init() {
        self.documentMonitor = DocumentMonitor()
        self.extractionPipeline = ExtractionPipeline()
        self.normalizationEngine = NormalizationEngine()
        self.optimizationEngine = OptimizationEngine()
    }
    
    func startProcessing() {
        documentMonitor.onDocumentChange = { [weak self] documents in
            self?.processDocuments(documents)
        }
        documentMonitor.startMonitoring()
    }
    
    private func processDocuments(_ documents: [Document]) {
        Task.detached(priority: .utility) {
            // Extract metrics
            let extractedData = await self.extractionPipeline.extract(from: documents)
            
            // Normalize data
            let normalizedData = self.normalizationEngine.normalize(extractedData)
            
            // Optimize for widget
            let optimizedData = self.optimizationEngine.optimize(normalizedData)
            
            // Store results
            await self.storeResults(optimizedData)
        }
    }
}
```

## Document Monitoring System

### Change Detection

```swift
class DocumentMonitor {
    private var lastProcessedDate: Date
    private let fileManager = FileManager.default
    private let processingQueue = DispatchQueue(label: "document.monitor", qos: .utility)
    
    var onDocumentChange: (([Document]) -> Void)?
    
    init() {
        self.lastProcessedDate = UserDefaults.shared.object(forKey: "lastProcessedDate") as? Date 
                            ?? Date.distantPast
    }
    
    func startMonitoring() {
        // File system monitoring
        startFileSystemMonitoring()
        
        // Periodic scanning
        startPeriodicScanning()
        
        // Cloud sync monitoring
        startCloudMonitoring()
    }
    
    private func startFileSystemMonitoring() {
        #if os(macOS)
        let stream = FSEventStreamCreate(
            kCFAllocatorDefault,
            { (_, _, numEvents, paths, flags, _) in
                // Handle file system events
            },
            nil,
            [documentsDirectoryPath] as CFArray,
            FSEventStreamEventId(kFSEventStreamEventIdSinceNow),
            1.0, // 1 second latency
            UInt32(kFSEventStreamCreateFlagFileEvents)
        )
        
        FSEventStreamScheduleWithRunLoop(stream, CFRunLoopGetCurrent(), kCFRunLoopDefaultMode)
        FSEventStreamStart(stream)
        #else
        // iOS file monitoring
        startPeriodicScanning()
        #endif
    }
    
    private func startPeriodicScanning() {
        Timer.scheduledTimer(withTimeInterval: 300) { [weak self] _ in
            self?.scanForChanges()
        }
    }
    
    private func scanForChanges() {
        processingQueue.async { [weak self] in
            guard let self = self else { return }
            
            let documents = self.fetchDocumentsModified(after: self.lastProcessedDate)
            
            if !documents.isEmpty {
                self.lastProcessedDate = Date()
                UserDefaults.shared.set(self.lastProcessedDate, forKey: "lastProcessedDate")
                
                DispatchQueue.main.async {
                    self.onDocumentChange?(documents)
                }
            }
        }
    }
    
    private func fetchDocumentsModified(after date: Date) -> [Document] {
        let documentsURL = FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: "group.com.yourapp.documents")!
        
        guard let enumerator = fileManager.enumerator(
            at: documentsURL,
            includingPropertiesForKeys: [.contentModificationDateKey],
            options: [.skipsHiddenFiles]
        ) else {
            return []
        }
        
        var modifiedDocuments: [Document] = []
        
        for case let fileURL as URL in enumerator {
            do {
                let attributes = try fileURL.resourceValues(forKeys: [.contentModificationDateKey])
                
                if let modificationDate = attributes.contentModificationDate,
                   modificationDate > date {
                    if let document = Document(fileURL: fileURL) {
                        modifiedDocuments.append(document)
                    }
                }
            } catch {
                print("Error processing file \(fileURL): \(error)")
            }
        }
        
        return modifiedDocuments
    }
}
```

## Natural Language Processing Pipeline

### Entity Extraction

```swift
import NaturalLanguage

class ExtractionPipeline {
    private let tagger = NLTagger(tagSchemes: [.nameType, .lexicalClass])
    
    func extract(from documents: [Document]) async -> [ExtractedMetrics] {
        var allMetrics: [ExtractedMetrics] = []
        
        await withTaskGroup(of: ExtractedMetrics?.self) { group in
            for document in documents {
                group.addTask {
                    await self.extractMetrics(from: document)
                }
            }
            
            for await metrics in group {
                if let metrics = metrics {
                    allMetrics.append(metrics)
                }
            }
        }
        
        return allMetrics
    }
    
    private func extractMetrics(from document: Document) async -> ExtractedMetrics? {
        do {
            let content = try String(contentsOf: document.fileURL)
            
            // Extract different types of metrics
            let financialMetrics = await extractFinancialMetrics(from: content)
            let sentimentMetrics = await extractSentimentMetrics(from: content)
            let temporalMetrics = await extractTemporalMetrics(from: content)
            let categoricalMetrics = await extractCategoricalMetrics(from: content)
            
            return ExtractedMetrics(
                documentID: document.id,
                financial: financialMetrics,
                sentiment: sentimentMetrics,
                temporal: temporalMetrics,
                categorical: categoricalMetrics,
                extractionDate: Date(),
                confidence: calculateConfidence(financialMetrics, sentimentMetrics, 
                                              temporalMetrics, categoricalMetrics)
            )
            
        } catch {
            print("Error extracting metrics from \(document.fileURL): \(error)")
            return nil
        }
    }
    
    private func extractFinancialMetrics(from text: String) async -> [FinancialMetric] {
        var metrics: [FinancialMetric] = []
        
        // Currency extraction
        let currencyPattern = #"\$[0-9,]+(?:\.[0-9]{2})?"#
        let currencyRegex = try! NSRegularExpression(pattern: currencyPattern)
        
        let currencyMatches = currencyRegex.matches(in: text, range: NSRange(text.startIndex..., in: text))
        
        for match in currencyMatches {
            if let range = Range(match.range, in: text) {
                let valueString = String(text[range]).replacingOccurrences(of: "[$,]", 
                                                                           with: "", 
                                                                           options: .regularExpression)
                if let value = Double(valueString.replacingOccurrences(of: "$", with: "")) {
                    metrics.append(FinancialMetric(
                        type: .currency,
                        value: value,
                        context: extractContext(text, around: range),
                        timestamp: Date()
                    ))
                }
            }
        }
        
        // Percentage extraction
        let percentagePattern = #"[0-9]+(?:\.[0-9]+)?%"#
        let percentageRegex = try! NSRegularExpression(pattern: percentagePattern)
        
        let percentageMatches = percentageRegex.matches(in: text, range: NSRange(text.startIndex..., in: text))
        
        for match in percentageMatches {
            if let range = Range(match.range, in: text) {
                let percentageString = String(text[range]).replacingOccurrences(of: "%", with: "")
                if let percentage = Double(percentageString) {
                    metrics.append(FinancialMetric(
                        type: .percentage,
                        value: percentage,
                        context: extractContext(text, around: range),
                        timestamp: Date()
                    ))
                }
            }
        }
        
        return metrics
    }
    
    private func extractSentimentMetrics(from text: String) async -> SentimentMetrics {
        tagger.string = text
        
        var positiveWords: [String] = []
        var negativeWords: [String] = []
        var neutralWords: [String] = []
        
        tagger.enumerateTags(in: text.startIndex..<text.endIndex, 
                            unit: .word, 
                            scheme: .sentimentScore) { tag, range in
            
            let word = String(text[range]).lowercased()
            
            switch tag {
            case .positive:
                positiveWords.append(word)
            case .negative:
                negativeWords.append(word)
            case .neutral:
                neutralWords.append(word)
            default:
                neutralWords.append(word)
            }
            
            return true
        }
        
        let sentimentScore = Double(positiveWords.count - negativeWords.count) / 
                           Double(positiveWords.count + negativeWords.count + neutralWords.count)
        
        return SentimentMetrics(
            score: sentimentScore,
            positiveCount: positiveWords.count,
            negativeCount: negativeWords.count,
            neutralCount: neutralWords.count,
            dominantSentiment: sentimentScore > 0 ? .positive : sentimentScore < 0 ? .negative : .neutral
        )
    }
    
    private func extractTemporalMetrics(from text: String) async -> TemporalMetrics {
        let tagger = NLTagger(tagSchemes: [.nameType])
        tagger.string = text
        
        var dates: [Date] = []
        
        tagger.enumerateTags(in: text.startIndex..<text.endIndex, 
                            unit: .word, 
                            scheme: .nameType) { tag, range in
            
            if tag == .date {
                let dateString = String(text[range])
                if let date = parseDate(dateString) {
                    dates.append(date)
                }
            }
            
            return true
        }
        
        return TemporalMetrics(
            extractedDates: dates,
            earliestDate: dates.min(),
            latestDate: dates.max(),
            dateRange: dates.isEmpty ? nil : DateInterval(
                start: dates.min()!, 
                end: dates.max()!
            )
        )
    }
    
    private func extractCategoricalMetrics(from text: String) async -> [CategoricalMetric] {
        // Custom category extraction based on business logic
        let categories = [
            (name: "Financial", keywords: ["revenue", "profit", "cost", "budget"]),
            (name: "Technical", keywords: ["algorithm", "data", "system", "performance"]),
            (name: "Marketing", keywords: ["campaign", "engagement", "conversion", "ROI"])
        ]
        
        var metrics: [CategoricalMetric] = []
        let lowercasedText = text.lowercased()
        
        for category in categories {
            let keywordCount = category.keywords.reduce(0) { count, keyword in
                count + lowercasedText.components(separatedBy: keyword).count - 1
            }
            
            if keywordCount > 0 {
                metrics.append(CategoricalMetric(
                    category: category.name,
                    relevance: Double(keywordCount) / Double(text.split(separator: " ").count),
                    keywordMatches: keywordCount
                ))
            }
        }
        
        return metrics
    }
    
    private func extractContext(_ text: String, around range: Range<String.Index>) -> String {
        let contextStart = text.index(range.lowerBound, offsetBy: -50, limitedBy: text.startIndex) ?? text.startIndex
        let contextEnd = text.index(range.upperBound, offsetBy: 50, limitedBy: text.endIndex) ?? text.endIndex
        return String(text[contextStart..<contextEnd])
    }
    
    private func parseDate(_ dateString: String) -> Date? {
        let detector = try! NSDataDetector(types: NSTextCheckingResult.CheckingType.date.rawValue)
        let matches = detector.matches(in: dateString, options: [], range: NSRange(location: 0, length: dateString.count))
        
        return matches.first?.date
    }
    
    private func calculateConfidence(_ metrics: ExtractedMetrics...) -> Double {
        // Simple confidence calculation based on data quality
        let validMetrics = metrics.filter { $0 != nil }.count
        return Double(validMetrics) / Double(metrics.count)
    }
}
```

## Normalization Engine

### Coordinate Space Normalization

```swift
class NormalizationEngine {
    
    struct NormalizationContext {
        let minValue: Double
        let maxValue: Double
        let range: ClosedRange<Double>
        let targetRange: ClosedRange<Double>
    }
    
    func normalize(_ metrics: [ExtractedMetrics]) -> NormalizedData {
        // Group metrics by type
        let groupedMetrics = Dictionary(grouping: metrics) { $0.documentID }
        
        // Calculate global statistics for normalization
        let globalStats = calculateGlobalStatistics(metrics)
        
        // Normalize each document's metrics
        var normalizedSeries: [NormalizedSeries] = []
        
        for (documentID, documentMetrics) in groupedMetrics {
            let normalizedPoints = normalizeDocumentMetrics(
                documentMetrics,
                globalStats: globalStats
            )
            
            normalizedSeries.append(NormalizedSeries(
                documentID: documentID,
                points: normalizedPoints,
                statistics: calculateSeriesStatistics(normalizedPoints)
            ))
        }
        
        return NormalizedData(
            series: normalizedSeries,
            globalStatistics: globalStats,
            normalizationDate: Date()
        )
    }
    
    private func calculateGlobalStatistics(_ metrics: [ExtractedMetrics]) -> GlobalStatistics {
        var allFinancialValues: [Double] = []
        var allSentimentScores: [Double] = []
        var allTemporalSpans: [TimeInterval] = []
        
        for metric in metrics {
            allFinancialValues.append(contentsOf: metric.financial.map { $0.value })
            allSentimentScores.append(metric.sentiment.score)
            
            if let temporalRange = metric.temporal.dateRange {
                allTemporalSpans.append(temporalRange.duration)
            }
        }
        
        return GlobalStatistics(
            financialRange: allFinancialValues.min()...allFinancialValues.max(),
            sentimentRange: allSentimentScores.min()...allSentimentScores.max(),
            temporalRange: allTemporalSpans.min()...allTemporalSpans.max(),
            totalDocuments: metrics.count
        )
    }
    
    private func normalizeDocumentMetrics(_ metrics: [ExtractedMetrics], 
                                        globalStats: GlobalStatistics) -> [NormalizedPoint] {
        var points: [NormalizedPoint] = []
        
        for metric in metrics {
            // Normalize financial values to 0-1 range
            let normalizedFinancial = metric.financial.map { financial in
                normalizeValue(
                    financial.value,
                    from: globalStats.financialRange,
                    to: 0.0...1.0
                )
            }
            
            // Normalize sentiment to -1 to 1 range
            let normalizedSentiment = normalizeValue(
                metric.sentiment.score,
                from: globalStats.sentimentRange,
                to: -1.0...1.0
            )
            
            // Create temporal coordinates
            let temporalCoordinate = metric.temporal.earliestDate?.timeIntervalSince1970 ?? 0
            
            // Combine metrics into visualization coordinates
            let point = NormalizedPoint(
                x: temporalCoordinate,
                y: normalizedFinancial.first ?? normalizedSentiment,
                z: normalizedSentiment, // Use for color/depth
                metadata: createPointMetadata(from: metric)
            )
            
            points.append(point)
        }
        
        return points
    }
    
    private func normalizeValue(_ value: Double, 
                              from sourceRange: ClosedRange<Double>,
                              to targetRange: ClosedRange<Double>) -> Double {
        let normalized = (value - sourceRange.lowerBound) / 
                        (sourceRange.upperBound - sourceRange.lowerBound)
        
        return targetRange.lowerBound + 
               (normalized * (targetRange.upperBound - targetRange.lowerBound))
    }
    
    private func createPointMetadata(from metric: ExtractedMetrics) -> PointMetadata {
        return PointMetadata(
            documentID: metric.documentID,
            confidence: metric.confidence,
            category: metric.categorical.first?.category ?? "Unknown",
            extractionDate: metric.extractionDate
        )
    }
    
    private func calculateSeriesStatistics(_ points: [NormalizedPoint]) -> SeriesStatistics {
        let xValues = points.map { $0.x }
        let yValues = points.map { $0.y }
        let zValues = points.map { $0.z }
        
        return SeriesStatistics(
            xRange: xValues.min()...xValues.max(),
            yRange: yValues.min()...yValues.max(),
            zRange: zValues.min()...zValues.max(),
            pointCount: points.count,
            density: calculatePointDensity(points)
        )
    }
    
    private func calculatePointDensity(_ points: [NormalizedPoint]) -> Double {
        guard points.count > 1 else { return 0 }
        
        let xRange = points.map { $0.x }.max()! - points.map { $0.x }.min()!
        let averageSpacing = xRange / Double(points.count - 1)
        
        return 1.0 / averageSpacing // Higher density = lower spacing
    }
}
```

### Time Series Normalization

```swift
extension NormalizationEngine {
    
    func normalizeTimeSeries(_ data: [TemporalDataPoint]) -> NormalizedTimeSeries {
        // Sort by timestamp
        let sortedData = data.sorted { $0.timestamp < $1.timestamp }
        
        // Find time range
        let timestamps = sortedData.map { $0.timestamp }
        let timeRange = timestamps.first!...timestamps.last!
        
        // Find value range
        let values = sortedData.map { $0.value }
        let valueRange = values.min()!...values.max()!
        
        // Normalize points
        var normalizedPoints: [NormalizedTimePoint] = []
        
        for point in sortedData {
            let normalizedTime = normalizeTime(point.timestamp, within: timeRange)
            let normalizedValue = normalizeValue(point.value, within: valueRange)
            
            normalizedPoints.append(NormalizedTimePoint(
                time: normalizedTime,
                value: normalizedValue,
                originalTime: point.timestamp,
                originalValue: point.value,
                metadata: point.metadata
            ))
        }
        
        return NormalizedTimeSeries(
            points: normalizedPoints,
            timeRange: timeRange,
            valueRange: valueRange,
            normalizedTimeRange: 0.0...1.0,
            normalizedValueRange: 0.0...1.0
        )
    }
    
    private func normalizeTime(_ timestamp: Date, within range: ClosedRange<Date>) -> Double {
        let totalDuration = range.upperBound.timeIntervalSince(range.lowerBound)
        let elapsed = timestamp.timeIntervalSince(range.lowerBound)
        return elapsed / totalDuration
    }
    
    private func normalizeValue(_ value: Double, within range: ClosedRange<Double>) -> Double {
        return (value - range.lowerBound) / (range.upperBound - range.lowerBound)
    }
}
```

## Optimization Engine

### Downsampling Strategies

```swift
class OptimizationEngine {
    
    func optimize(_ data: NormalizedData) -> OptimizedData {
        var optimizedSeries: [OptimizedSeries] = []
        
        for series in data.series {
            // Apply multiple optimization strategies
            let downsampled = applyDownsampling(series)
            let simplified = applyLineSimplification(downsampled)
            let compressed = compressMetadata(simplified)
            
            optimizedSeries.append(compressed)
        }
        
        return OptimizedData(
            series: optimizedSeries,
            optimizationDate: Date(),
            compressionRatio: calculateCompressionRatio(data, optimizedSeries)
        )
    }
    
    private func applyDownsampling(_ series: NormalizedSeries) -> NormalizedSeries {
        let targetPointCount = calculateOptimalPointCount(series)
        
        guard series.points.count > targetPointCount else {
            return series // No downsampling needed
        }
        
        // Use Largest Triangle Three Buckets (LTTB) algorithm
        let downsampledPoints = largestTriangleThreeBuckets(
            series.points,
            threshold: targetPointCount
        )
        
        return NormalizedSeries(
            documentID: series.documentID,
            points: downsampledPoints,
            statistics: calculateSeriesStatistics(downsampledPoints)
        )
    }
    
    private func calculateOptimalPointCount(_ series: NormalizedSeries) -> Int {
        // Widget display optimization
        // iPhone widget width: ~329 points
        // 1 point per data point for pixel-perfect rendering
        return 329
    }
    
    private func largestTriangleThreeBuckets(_ points: [NormalizedPoint], 
                                           threshold: Int) -> [NormalizedPoint] {
        guard points.count > threshold else { return points }
        
        var sampled: [NormalizedPoint] = []
        let bucketSize = Double(points.count) / Double(threshold - 2)
        
        // Always include first and last points
        sampled.append(points.first!)
        
        for bucket in 1..<(threshold - 1) {
            let startIndex = Int(Double(bucket) * bucketSize)
            let endIndex = min(Int(Double(bucket + 1) * bucketSize), points.count - 1)
            
            let prevPoint = sampled.last!
            let nextPoint = points[endIndex]
            
            // Find point with largest triangle area
            var maxArea: Double = 0
            var maxPoint: NormalizedPoint?
            
            for i in startIndex..<endIndex {
                let currentPoint = points[i]
                let area = triangleArea(prevPoint, currentPoint, nextPoint)
                
                if area > maxArea {
                    maxArea = area
                    maxPoint = currentPoint
                }
            }
            
            if let maxPoint = maxPoint {
                sampled.append(maxPoint)
            }
        }
        
        sampled.append(points.last!)
        return sampled
    }
    
    private func triangleArea(_ a: NormalizedPoint, _ b: NormalizedPoint, _ c: NormalizedPoint) -> Double {
        return abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2.0)
    }
    
    private func applyLineSimplification(_ series: NormalizedSeries) -> NormalizedSeries {
        // Apply Visvalingam-Whyatt algorithm for visual quality
        let simplifiedPoints = visvalingamWhyatt(
            series.points,
            tolerance: 0.01
        )
        
        return NormalizedSeries(
            documentID: series.documentID,
            points: simplifiedPoints,
            statistics: calculateSeriesStatistics(simplifiedPoints)
        )
    }
    
    private func visvalingamWhyatt(_ points: [NormalizedPoint], tolerance: Double) -> [NormalizedPoint] {
        guard points.count > 3 else { return points }
        
        var pointsWithAreas: [(point: NormalizedPoint, area: Double)] = []
        
        // Calculate triangle areas for all middle points
        for i in 1..<(points.count - 1) {
            let area = triangleArea(points[i-1], points[i], points[i+1])
            pointsWithAreas.append((points[i], area))
        }
        
        // Sort by area and remove smallest areas
        let sortedAreas = pointsWithAreas.sorted { $0.area < $1.area }
        let thresholdIndex = Int(Double(sortedAreas.count) * tolerance)
        let removedPoints = Set(sortedAreas.prefix(thresholdIndex).map { $0.point })
        
        // Return points not removed, preserving order
        return points.filter { !removedPoints.contains($0) }
    }
    
    private func compressMetadata(_ series: NormalizedSeries) -> OptimizedSeries {
        // Compress metadata for widget efficiency
        let compressedMetadata = series.points.map { point in
            CompressedMetadata(
                documentID: point.metadata.documentID,
                confidence: Float(point.metadata.confidence),
                categoryHash: point.metadata.category.hashValue & 0xFFFF, // 16-bit hash
                extractionDate: UInt32(point.metadata.extractionDate.timeIntervalSince1970)
            )
        }
        
        return OptimizedSeries(
            documentID: series.documentID,
            points: series.points,
            compressedMetadata: compressedMetadata,
            statistics: series.statistics
        )
    }
    
    private func calculateCompressionRatio(_ original: NormalizedData, 
                                         _ optimized: [OptimizedSeries]) -> Double {
        let originalSize = original.series.reduce(0) { $0 + $1.points.count }
        let optimizedSize = optimized.reduce(0) { $0 + $1.points.count }
        
        return Double(originalSize) / Double(optimizedSize)
    }
}
```

## Background Processing Integration

### BGProcessingTask Integration

```swift
class BackgroundAggregationScheduler {
    
    func scheduleAggregationTask() {
        let request = BGProcessingTaskRequest(identifier: "com.yourapp.aggregation")
        request.requiresNetworkConnectivity = false
        request.requiresExternalPower = false
        
        // Schedule for optimal times (usually overnight)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 3600) // 1 hour from now
        
        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Failed to schedule aggregation task: \(error)")
        }
    }
    
    func handleAggregationTask(_ task: BGProcessingTask) {
        let queue = OperationQueue()
        queue.maxConcurrentOperationCount = 1
        
        let aggregationOperation = AggregationOperation()
        
        task.expirationHandler = {
            queue.cancelAllOperations()
        }
        
        aggregationOperation.completionBlock = {
            task.setTaskCompleted(success: !aggregationOperation.isCancelled)
        }
        
        queue.addOperation(aggregationOperation)
    }
}

class AggregationOperation: Operation {
    private let engine = AggregationEngine()
    
    override func main() {
        if isCancelled { return }
        
        let semaphore = DispatchSemaphore(value: 0)
        
        engine.processAllDocuments { [weak self] result in
            defer { semaphore.signal() }
            
            if self?.isCancelled == true { return }
            
            switch result {
            case .success(let optimizedData):
                self?.saveToSharedContainer(optimizedData)
            case .failure(let error):
                print("Aggregation failed: \(error)")
            }
        }
        
        semaphore.wait()
    }
    
    private func saveToSharedContainer(_ data: OptimizedData) {
        let container = FileManager.default
            .containerURL(forSecurityApplicationGroupIdentifier: "group.com.yourapp.data")!
        
        let fileURL = container.appendingPathComponent("aggregated_data.flatbuffer")
        
        // Convert to FlatBuffer and save
        let builder = ChartDataBuilder()
        let flatBufferData = builder.buildChartData(from: data)
        
        try? flatBufferData.write(to: fileURL)
        
        // Notify widgets of new data
        WidgetCenter.shared.reloadTimelines(ofKind: "chartWidget")
    }
}
```

## Error Handling and Recovery

```swift
extension AggregationEngine {
    
    func processAllDocuments(completion: @escaping (Result<OptimizedData, Error>) -> Void) {
        do {
            let documents = try fetchAllDocuments()
            
            // Process with retry logic
            processWithRetry(documents: documents, attempt: 1, completion: completion)
            
        } catch {
            completion(.failure(error))
        }
    }
    
    private func processWithRetry(documents: [Document], 
                                attempt: Int,
                                completion: @escaping (Result<OptimizedData, Error>) -> Void) {
        
        Task {
            do {
                let extracted = await extractionPipeline.extract(from: documents)
                let normalized = normalizationEngine.normalize(extracted)
                let optimized = optimizationEngine.optimize(normalized)
                
                completion(.success(optimized))
                
            } catch {
                if attempt < 3 {
                    // Exponential backoff
                    let delay = pow(2.0, Double(attempt))
                    try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                    
                    processWithRetry(documents: documents, 
                                   attempt: attempt + 1, 
                                   completion: completion)
                } else {
                    completion(.failure(error))
                }
            }
        }
    }
    
    private func fetchAllDocuments() throws -> [Document] {
        // Implementation for fetching all documents
        return []
    }
}
```

## Monitoring and Diagnostics

```swift
class AggregationMonitor {
    private let metrics = AggregationMetrics()
    
    func recordExtraction(duration: TimeInterval, documentCount: Int) {
        metrics.extractionDuration = duration
        metrics.processedDocumentCount = documentCount
        metrics.extractionThroughput = Double(documentCount) / duration
    }
    
    func recordNormalization(duration: TimeInterval, pointCount: Int) {
        metrics.normalizationDuration = duration
        metrics.normalizedPointCount = pointCount
    }
    
    func recordOptimization(duration: TimeInterval, compressionRatio: Double) {
        metrics.optimizationDuration = duration
        metrics.compressionRatio = compressionRatio
    }
    
    func generateReport() -> AggregationReport {
        return AggregationReport(
            timestamp: Date(),
            totalDuration: metrics.totalDuration,
            throughput: metrics.overallThroughput,
            compressionRatio: metrics.compressionRatio,
            memoryPeak: metrics.memoryPeak,
            errors: metrics.errorCount
        )
    }
}

struct AggregationMetrics {
    var extractionDuration: TimeInterval = 0
    var normalizationDuration: TimeInterval = 0
    var optimizationDuration: TimeInterval = 0
    var processedDocumentCount: Int = 0
    var normalizedPointCount: Int = 0
    var compressionRatio: Double = 0
    var memoryPeak: Int = 0
    var errorCount: Int = 0
    
    var totalDuration: TimeInterval {
        extractionDuration + normalizationDuration + optimizationDuration
    }
    
    var overallThroughput: Double {
        Double(processedDocumentCount) / totalDuration
    }
}
```

## Conclusion

The Aggregation Engine is the cornerstone of transforming raw document data into widget-ready visualizations. Through sophisticated NLP extraction, intelligent normalization, and aggressive optimization, it enables widgets to present meaningful insights from hundreds of documents while respecting system constraints.

## References

- Apple Natural Language Framework Documentation
- FlatBuffers Documentation
- Apple Background Tasks Framework
- WWDC Sessions: Core ML and Natural Language
- Research Papers: Text Mining and Information Extraction
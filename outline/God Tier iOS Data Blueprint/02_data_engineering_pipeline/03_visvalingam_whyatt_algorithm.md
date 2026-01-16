# Visvalingam-Whyatt Algorithm Implementation

## Executive Summary

The Visvalingam-Whyatt algorithm provides superior line simplification for data visualization by preserving the visual character of trend lines. This document provides comprehensive analysis and implementation strategies for applying this algorithm to widget-bound data.

## Algorithm Fundamentals

### Core Concept

Unlike the Ramer-Douglas-Peucker (RDP) algorithm which uses perpendicular distance, Visvalingam-Whyatt simplifies lines by iteratively removing points that contribute least to the visual shape of the line based on triangle area.

### Algorithm Steps

1. Calculate the effective area (triangle area) for each point
2. Remove the point with the smallest area
3. Recalculate areas for affected neighboring points
4. Repeat until target point count reached

### Visual Advantage

```swift
// Visvalingam-Whyatt preserves smooth curves better than RDP
// Original data: 1000 points
let originalPoints = generateTimeSeriesData(points: 1000)

// RDP result: Can create jagged, unnatural simplifications
let rdpSimplified = ramerDouglasPeucker(originalPoints, tolerance: 0.01)
// Result: May have sharp angles and unnatural breaks

// Visvalingam-Whyatt result: Maintains visual character
let vwSimplified = visvalingamWhyatt(originalPoints, threshold: 100)
// Result: Smooth, organic simplification that preserves shape
```

## Implementation

### Basic Implementation

```swift
struct VisvalingamWhyattSimplifier {
    
    struct Point: Hashable {
        let x: Double
        let y: Double
        let id: UUID
        var area: Double
        
        init(x: Double, y: Double, id: UUID = UUID()) {
            self.x = x
            self.y = y
            self.id = id
            self.area = 0
        }
    }
    
    func simplify(_ points: [ChartPoint], targetCount: Int) -> [ChartPoint] {
        guard points.count > targetCount, targetCount >= 3 else {
            return points
        }
        
        var workingPoints = points.enumerated().map { index, point in
            Point(
                x: point.timestamp,
                y: point.value,
                id: point.id ?? UUID()
            )
        }
        
        // Calculate initial areas
        calculateAreas(for: &workingPoints)
        
        // Priority queue for efficient area-based removal
        var pointQueue = PriorityQueue<Point>(sort: { $0.area < $1.area })
        pointQueue.enqueue(contentsOf: workingPoints.dropFirst().dropLast())
        
        // Remove points until target count reached
        while workingPoints.count > targetCount {
            guard let minAreaPoint = pointQueue.dequeue() else { break }
            
            // Find index of point to remove
            if let index = workingPoints.firstIndex(where: { $0.id == minAreaPoint.id }) {
                // Never remove first or last points
                if index > 0 && index < workingPoints.count - 1 {
                    workingPoints.remove(at: index)
                    
                    // Recalculate areas for affected neighbors
                    if index > 0 {
                        updateArea(at: index - 1, in: &workingPoints)
                    }
                    if index < workingPoints.count - 1 {
                        updateArea(at: index, in: &workingPoints)
                    }
                    
                    // Update queue with new areas
                    if index > 0 {
                        pointQueue.enqueue(workingPoints[index - 1])
                    }
                    if index < workingPoints.count - 1 {
                        pointQueue.enqueue(workingPoints[index])
                    }
                }
            }
        }
        
        return workingPoints.map { point in
            ChartPoint(
                timestamp: point.x,
                value: point.y,
                label: "",
                category: "",
                id: point.id
            )
        }
    }
    
    private func calculateAreas(for points: inout [Point]) {
        for i in 1..<(points.count - 1) {
            points[i].area = triangleArea(
                points[i - 1],
                points[i],
                points[i + 1]
            )
        }
        
        // First and last points have infinite area (never removed)
        if !points.isEmpty {
            points[0].area = .infinity
            points[points.count - 1].area = .infinity
        }
    }
    
    private func updateArea(at index: Int, in points: inout [Point]) {
        guard index > 0 && index < points.count - 1 else { return }
        
        points[index].area = triangleArea(
            points[index - 1],
            points[index],
            points[index + 1]
        )
    }
    
    private func triangleArea(_ a: Point, _ b: Point, _ c: Point) -> Double {
        return abs(
            (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2.0
        )
    }
}

// Priority Queue implementation for efficient point removal
struct PriorityQueue<T> {
    private var elements: [T] = []
    private let sort: (T, T) -> Bool
    
    init(sort: @escaping (T, T) -> Bool) {
        self.sort = sort
    }
    
    mutating func enqueue(_ element: T) {
        elements.append(element)
        elements.sort(by: sort)
    }
    
    mutating func enqueue(contentsOf newElements: [T]) {
        elements.append(contentsOf: newElements)
        elements.sort(by: sort)
    }
    
    mutating func dequeue() -> T? {
        return elements.isEmpty ? nil : elements.removeFirst()
    }
    
    var isEmpty: Bool {
        return elements.isEmpty
    }
}
```

### Optimized Implementation with Min-Heap

```swift
class OptimizedVisvalingamWhyatt {
    
    private struct TriangleArea: Comparable {
        let pointIndex: Int
        let area: Double
        
        static func < (lhs: TriangleArea, rhs: TriangleArea) -> Bool {
            return lhs.area < rhs.area
        }
    }
    
    private class PointNode {
        let index: Int
        let x: Double
        let y: Double
        var previous: PointNode?
        var next: PointNode?
        var area: Double = 0
        
        init(index: Int, x: Double, y: Double) {
            self.index = index
            self.x = x
            self.y = y
        }
    }
    
    func simplify(_ points: [ChartPoint], targetCount: Int) -> [ChartPoint] {
        guard points.count > targetCount, targetCount >= 3 else {
            return points
        }
        
        // Create doubly-linked list
        let head = createLinkedList(from: points)
        
        // Min-heap for efficient area-based removal
        var minHeap = MinHeap<TriangleArea>()
        
        // Calculate initial areas and populate heap
        var current = head?.next
        while current != nil && current?.next != nil {
            let area = calculateTriangleArea(
                previous: current!.previous!,
                current: current!,
                next: current!.next!
            )
            current!.area = area
            
            minHeap.insert(TriangleArea(pointIndex: current!.index, area: area))
            
            current = current?.next
        }
        
        // Remove points until target count
        var remainingCount = points.count
        var removedIndices = Set<Int>()
        
        while remainingCount > targetCount && !minHeap.isEmpty {
            guard let minArea = minHeap.extractMin() else { break }
            
            // Skip if already removed
            if removedIndices.contains(minArea.pointIndex) {
                continue
            }
            
            // Find and remove point
            if let nodeToRemove = findNode(at: minArea.pointIndex, startingFrom: head) {
                // Update neighbors
                if let prev = nodeToRemove.previous {
                    prev.next = nodeToRemove.next
                }
                
                if let next = nodeToRemove.next {
                    next.previous = nodeToRemove.previous
                }
                
                // Recalculate areas for affected neighbors
                if let prev = nodeToRemove.previous,
                   let prevPrev = prev.previous {
                    let newArea = calculateTriangleArea(
                        previous: prevPrev,
                        current: prev,
                        next: nodeToRemove.next ?? prev
                    )
                    prev.area = newArea
                    minHeap.insert(TriangleArea(pointIndex: prev.index, area: newArea))
                }
                
                if let next = nodeToRemove.next,
                   let nextNext = next.next {
                    let newArea = calculateTriangleArea(
                        previous: nodeToRemove.previous ?? next,
                        current: next,
                        next: nextNext
                    )
                    next.area = newArea
                    minHeap.insert(TriangleArea(pointIndex: next.index, area: newArea))
                }
                
                removedIndices.insert(minArea.pointIndex)
                remainingCount -= 1
            }
        }
        
        // Collect remaining points in order
        return collectPoints(from: head, originalCount: points.count, 
                           removedIndices: removedIndices, originalPoints: points)
    }
    
    private func createLinkedList(from points: [ChartPoint]) -> PointNode? {
        guard !points.isEmpty else { return nil }
        
        var nodes: [PointNode] = []
        
        for (index, point) in points.enumerated() {
            let node = PointNode(index: index, x: point.timestamp, y: point.value)
            nodes.append(node)
        }
        
        // Link nodes
        for i in 0..<nodes.count {
            if i > 0 {
                nodes[i].previous = nodes[i - 1]
            }
            if i < nodes.count - 1 {
                nodes[i].next = nodes[i + 1]
            }
        }
        
        return nodes.first
    }
    
    private func calculateTriangleArea(previous: PointNode, current: PointNode, next: PointNode) -> Double {
        return abs(
            (previous.x * (current.y - next.y) + 
             current.x * (next.y - previous.y) + 
             next.x * (previous.y - current.y)) / 2.0
        )
    }
    
    private func findNode(at index: Int, startingFrom head: PointNode?) -> PointNode? {
        var current = head
        while current != nil {
            if current!.index == index {
                return current
            }
            current = current?.next
        }
        return nil
    }
    
    private func collectPoints(from head: PointNode?, 
                             originalCount: Int,
                             removedIndices: Set<Int>,
                             originalPoints: [ChartPoint]) -> [ChartPoint] {
        var result: [ChartPoint] = []
        var current = head
        
        while current != nil {
            if !removedIndices.contains(current!.index) {
                result.append(originalPoints[current!.index])
            }
            current = current?.next
        }
        
        return result
    }
}

// Min-Heap implementation
struct MinHeap<T: Comparable> {
    private var elements: [T] = []
    
    var isEmpty: Bool {
        return elements.isEmpty
    }
    
    var count: Int {
        return elements.count
    }
    
    mutating func insert(_ element: T) {
        elements.append(element)
        siftUp(from: elements.count - 1)
    }
    
    mutating func extractMin() -> T? {
        guard !elements.isEmpty else { return nil }
        
        elements.swapAt(0, elements.count - 1)
        let min = elements.removeLast()
        siftDown(from: 0)
        
        return min
    }
    
    private func parentIndex(of index: Int) -> Int {
        return (index - 1) / 2
    }
    
    private func leftChildIndex(of index: Int) -> Int {
        return 2 * index + 1
    }
    
    private func rightChildIndex(of index: Int) -> Int {
        return 2 * index + 2
    }
    
    private mutating func siftUp(from index: Int) {
        var child = index
        var parent = parentIndex(of: child)
        
        while child > 0 && elements[child] < elements[parent] {
            elements.swapAt(child, parent)
            child = parent
            parent = parentIndex(of: child)
        }
    }
    
    private mutating func siftDown(from index: Int) {
        var parent = index
        
        while true {
            let left = leftChildIndex(of: parent)
            let right = rightChildIndex(of: parent)
            var candidate = parent
            
            if left < elements.count && elements[left] < elements[candidate] {
                candidate = left
            }
            
            if right < elements.count && elements[right] < elements[candidate] {
                candidate = right
            }
            
            if candidate == parent {
                return
            }
            
            elements.swapAt(parent, candidate)
            parent = candidate
        }
    }
}
```

## Widget-Specific Implementation

### Integration with Swift Charts

```swift
import SwiftUI
import Charts

struct VisvalingamChartView: View {
    let originalData: [ChartPoint]
    let targetPointCount: Int
    
    var simplifiedData: [ChartPoint] {
        let simplifier = OptimizedVisvalingamWhyatt()
        return simplifier.simplify(originalData, targetCount: targetPointCount)
    }
    
    var body: some View {
        Chart {
            LineMark(
                x: .value("Time", point.timestamp),
                y: .value("Value", point.value)
            )
            .foregroundStyle(.blue)
            .interpolationMethod(.catmullRom) // Smooth curves
        }
        .chartXAxis(.hidden)
        .chartYAxis(.hidden)
    }
}
```

### Dynamic Point Count Calculation

```swift
struct AdaptiveVisvalingamChart: View {
    @Environment(\.widgetFamily) var family
    let data: [ChartPoint]
    
    var optimalPointCount: Int {
        switch family {
        case .systemSmall:
            return 50 // Minimal points for small widget
        case .systemMedium:
            return 150 // Medium density
        case .systemLarge:
            return 300 // Full density for large widget
        default:
            return 100 // Conservative default
        }
    }
    
    var body: some View {
        if data.count <= optimalPointCount {
            // No simplification needed
            FullChartView(data: data)
        } else {
            // Apply Visvalingam-Whyatt simplification
            let simplified = VisvalingamWhyattSimplifier()
                .simplify(data, targetCount: optimalPointCount)
            
            SimplifiedChartView(data: simplified)
        }
    }
}
```

### Performance Monitoring

```swift
class VisvalingamPerformanceMonitor {
    
    struct PerformanceMetrics {
        let originalPointCount: Int
        let simplifiedPointCount: Int
        let simplificationTime: TimeInterval
        let compressionRatio: Double
        let memoryUsage: Int
    }
    
    static func measurePerformance(
        of simplifier: VisvalingamWhyattSimplifier,
        on data: [ChartPoint],
        targetCount: Int
    ) -> PerformanceMetrics {
        let startMemory = getCurrentMemoryUsage()
        let startTime = Date()
        
        let simplified = simplifier.simplify(data, targetCount: targetCount)
        
        let endTime = Date()
        let endMemory = getCurrentMemoryUsage()
        
        return PerformanceMetrics(
            originalPointCount: data.count,
            simplifiedPointCount: simplified.count,
            simplificationTime: endTime.timeIntervalSince(startTime),
            compressionRatio: Double(data.count) / Double(simplified.count),
            memoryUsage: endMemory - startMemory
        )
    }
    
    private static func getCurrentMemoryUsage() -> Int {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
        
        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_,
                         task_flavor_t(MACH_TASK_BASIC_INFO),
                         $0,
                         &count)
            }
        }
        
        if kerr == KERN_SUCCESS {
            return Int(info.resident_size) / 1024 / 1024
        }
        return 0
    }
}
```

## Comparison with Other Algorithms

### Ramer-Douglas-Peucker (RDP)

```swift
class RamerDouglasPeucker {
    
    func simplify(_ points: [ChartPoint], epsilon: Double) -> [ChartPoint] {
        guard points.count > 2 else { return points }
        
        // Find the point with maximum distance
        var maxDistance = 0.0
        var maxIndex = 0
        
        let firstPoint = points.first!
        let lastPoint = points.last!
        
        for i in 1..<(points.count - 1) {
            let distance = perpendicularDistance(
                from: points[i],
                to: (firstPoint, lastPoint)
            )
            
            if distance > maxDistance {
                maxDistance = distance
                maxIndex = i
            }
        }
        
        // If max distance is greater than epsilon, recursively simplify
        if maxDistance > epsilon {
            let leftPoints = Array(points[0...maxIndex])
            let rightPoints = Array(points[maxIndex...])
            
            let leftSimplified = simplify(leftPoints, epsilon: epsilon)
            let rightSimplified = simplify(rightPoints, epsilon: epsilon)
            
            // Combine results (excluding duplicate point)
            return Array(leftSimplified.dropLast()) + rightSimplified
        } else {
            // All points are within epsilon, return endpoints
            return [firstPoint, lastPoint]
        }
    }
    
    private func perpendicularDistance(from point: ChartPoint, 
                                       to line: (ChartPoint, ChartPoint)) -> Double {
        let (start, end) = line
        
        let numerator = abs(
            (end.timestamp - start.timestamp) * (start.value - point.value) -
            (start.timestamp - point.timestamp) * (end.value - start.value)
        )
        
        let denominator = sqrt(
            pow(end.timestamp - start.timestamp, 2) +
            pow(end.value - start.value, 2)
        )
        
        return numerator / denominator
    }
}
```

### Largest Triangle Three Buckets (LTTB)

```swift
class LargestTriangleThreeBuckets {
    
    func downsample(_ points: [ChartPoint], threshold: Int) -> [ChartPoint] {
        guard points.count > threshold else { return points }
        
        var sampled: [ChartPoint] = []
        let bucketSize = Double(points.count) / Double(threshold - 2)
        
        // Always include first point
        sampled.append(points.first!)
        
        for bucket in 1..<(threshold - 1) {
            let startIndex = Int(Double(bucket) * bucketSize)
            let endIndex = min(Int(Double(bucket + 1) * bucketSize), points.count - 1)
            
            let prevPoint = sampled.last!
            let nextPoint = points[endIndex]
            
            // Find point with largest triangle area
            var maxArea: Double = 0
            var selectedPoint: ChartPoint?
            
            for i in startIndex..<endIndex {
                let area = triangleArea(prevPoint, points[i], nextPoint)
                if area > maxArea {
                    maxArea = area
                    selectedPoint = points[i]
                }
            }
            
            if let selected = selectedPoint {
                sampled.append(selected)
            }
        }
        
        // Always include last point
        sampled.append(points.last!)
        
        return sampled
    }
    
    private func triangleArea(_ a: ChartPoint, _ b: ChartPoint, _ c: ChartPoint) -> Double {
        return abs(
            (a.timestamp * (b.value - c.value) + 
             b.timestamp * (c.value - a.value) + 
             c.timestamp * (a.value - b.value)) / 2.0
        )
    }
}
```

## Best Practices

1. **Choose Appropriate Target Count**: Match widget display resolution
2. **Preserve Endpoints**: Always keep first and last points
3. **Handle Edge Cases**: Single points, all same values
4. **Monitor Performance**: Track simplification time and memory
5. **Test Visual Quality**: Compare original vs simplified
6. **Consider Data Type**: Time series vs categorical data

## Conclusion

The Visvalingam-Whyatt algorithm provides superior visual quality for line simplification in data visualization widgets. By preserving the visual character of data trends while dramatically reducing point count, it enables widgets to display complex datasets within system constraints while maintaining aesthetic excellence.

## References

- "The Visvalingam-Whyatt Algorithm: A Detailed Analysis" - Academic Paper
- Swift Algorithm Club: Priority Queue Implementations
- Apple Developer Documentation: Performance Optimization
- Research Papers: Line Simplification Algorithms Comparison